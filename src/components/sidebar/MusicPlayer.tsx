import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type Track = {
  title: string;
  artist: string;
  src: string;
  cover: string;
  accent: string;
};

declare global {
  interface Window {
    __beihaiActiveAudio?: HTMLAudioElement;
  }
}

const STORAGE_KEY = "beihai-music-session";
const BACKGROUND_VOLUME = 0.25;

type MusicSession = {
  trackIndex: number;
  currentTime: number;
  volume: number;
  isPlaying: boolean;
};

const readMusicSession = (): MusicSession | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as MusicSession;
  } catch {
    return null;
  }
};

const writeMusicSession = (session: MusicSession) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures in private mode or quota limits.
  }
};

const getInitialSession = () => (typeof window === "undefined" ? null : readMusicSession());

const musicSrc = (filename: string) => `/music/${encodeURIComponent(filename)}`;

const musicCoverSrc = (filename: string) => {
  const coverName = filename.replace(/\.[^.]+$/, ".webp");
  return `/music/covers/${encodeURIComponent(coverName)}`;
};

const parseTrackName = (filename: string) => {
  const name = filename.replace(/\.[^.]+$/, "");
  const [artist, ...titleParts] = name.split(/\s*-\s*/);
  const title = titleParts.join(" - ");

  return {
    artist: artist || "未知歌手",
    title: title || name,
  };
};

const trackFiles = [
  {
    filename: "mizuki - Avid.mp3",
    accent: "from-primary/40 to-warm/30",
  },
  {
    filename: "Sound Horizon - 美しきもの.mp3",
    accent: "from-accent/35 to-primary/30",
  },
  {
    filename: "福禄寿FloruitShow - 我用什么把你留住.mp3",
    accent: "from-warm/35 to-accent/25",
  },
  {
    filename: "鹿乃 - 優しさの記憶.mp3",
    accent: "from-primary/35 to-accent/30",
  },
  {
    filename: "MyGO!!!!! - 栞.mp3",
    accent: "from-accent/40 to-warm/25",
  },
  {
    filename: "米津玄師 - Lemon.mp3",
    accent: "from-warm/40 to-primary/25",
  },
  {
    filename: "Justin Bieber - Peaches.mp3",
    accent: "from-warm/35 to-accent/30",
  },
];

const tracks: Track[] = trackFiles.map((track) => ({
  ...parseTrackName(track.filename),
  src: musicSrc(track.filename),
  cover: musicCoverSrc(track.filename),
  accent: track.accent,
}));

const TrackCover = ({
  track,
  className,
  fallbackClassName,
}: {
  track: Track;
  className: string;
  fallbackClassName?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br ${track.accent} ${fallbackClassName ?? className}`}
        aria-hidden="true"
      >
        <span className="text-xs font-bold text-white/90">{track.title.slice(0, 1)}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={track.cover}
      alt=""
      width={56}
      height={56}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
};

export default function MusicPlayer() {
  const initialSession = useMemo(() => getInitialSession(), []);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rangeRef = useRef<HTMLInputElement | null>(null);
  const hasAutoPlayedRef = useRef(false);
  const shouldAutoPlayRef = useRef(false);
  const shouldResumeRef = useRef(initialSession?.isPlaying ?? false);
  const pendingSeekRef = useRef<number | null>(initialSession?.currentTime ?? null);
  const isSeekingRef = useRef(false);
  const volumeRef = useRef(initialSession?.volume ?? BACKGROUND_VOLUME);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialSession?.trackIndex ?? 0);
  const [volume, setVolume] = useState(initialSession?.volume ?? BACKGROUND_VOLUME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true);

  const currentTrack = tracks[currentTrackIndex];
  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

  const persistSession = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    writeMusicSession({
      trackIndex: currentTrackIndex,
      currentTime: audio.currentTime,
      volume: volumeRef.current,
      isPlaying: !audio.paused,
    });
  };

  useEffect(() => {
    const audio = new Audio(currentTrack.src);
    audio.preload = "auto";
    audio.volume = volumeRef.current;
    audioRef.current = audio;
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    let isResumeArmed = false;
    const playAudio = async () => {
      const activeAudio = window.__beihaiActiveAudio;

      if (activeAudio && activeAudio !== audio && !activeAudio.paused) {
        activeAudio.pause();
      }

      if (audio.paused) {
        await audio.play();
      }

      window.__beihaiActiveAudio = audio;
    };
    const resumeOnInteraction = () => {
      document.removeEventListener("pointerdown", resumeOnInteraction);
      document.removeEventListener("keydown", resumeOnInteraction);
      isResumeArmed = false;
      playAudio().catch(() => {});
    };
    const tryPlay = () => {
      playAudio().catch(() => {
        if (isResumeArmed) {
          return;
        }

        isResumeArmed = true;
        document.addEventListener("pointerdown", resumeOnInteraction);
        document.addEventListener("keydown", resumeOnInteraction);
      });
    };

    const syncDuration = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
      }

      setDuration(audio.duration);
      setIsReady(true);
    };

    const handleLoadedMetadata = () => {
      syncDuration();

      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current;
        setCurrentTime(pendingSeekRef.current);
        pendingSeekRef.current = null;
      }

      if (shouldAutoPlayRef.current) {
        shouldAutoPlayRef.current = false;
        tryPlay();
        return;
      }

      if (shouldResumeRef.current) {
        shouldResumeRef.current = false;
        tryPlay();
        return;
      }

      if (!hasAutoPlayedRef.current && currentTrackIndex === 0 && !initialSession) {
        hasAutoPlayedRef.current = true;
        tryPlay();
      }
    };
    const handleTimeUpdate = () => {
      if (isSeekingRef.current) {
        return;
      }

      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setCurrentTime(0);
      pendingSeekRef.current = null;
      shouldAutoPlayRef.current = true;
      setCurrentTrackIndex((index) => (index + 1) % tracks.length);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("loadeddata", syncDuration);
    audio.addEventListener("canplay", syncDuration);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata();
    }

    return () => {
      persistSession();
      audio.pause();
      document.removeEventListener("pointerdown", resumeOnInteraction);
      document.removeEventListener("keydown", resumeOnInteraction);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("loadeddata", syncDuration);
      audio.removeEventListener("canplay", syncDuration);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);

      if (window.__beihaiActiveAudio === audio) {
        window.__beihaiActiveAudio = undefined;
      }

      audioRef.current = null;
    };
  }, [currentTrack.src]);

  useEffect(() => {
    persistSession();
  }, [currentTrackIndex, isPlaying, volume]);

  useEffect(() => {
    const handleBeforeUnload = () => persistSession();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentTrackIndex, isPlaying, volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      const activeAudio = window.__beihaiActiveAudio;

      if (activeAudio && activeAudio !== audio && !activeAudio.paused) {
        activeAudio.pause();
      }

      await audio.play();
      window.__beihaiActiveAudio = audio;
    } catch {
      setIsPlaying(false);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const nextTime = Math.max(0, value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const beginSeek = () => {
    isSeekingRef.current = true;
  };

  const endSeek = (value: number) => {
    seek(value);
    isSeekingRef.current = false;
  };

  const selectTrack = (index: number) => {
    if (index === currentTrackIndex) {
      return;
    }

    pendingSeekRef.current = null;
    shouldAutoPlayRef.current = isPlaying;
    setCurrentTrackIndex(index);
  };

  const moveTrack = (direction: 1 | -1) => {
    pendingSeekRef.current = null;
    shouldAutoPlayRef.current = isPlaying;
    setCurrentTrackIndex((index) => (index + direction + tracks.length) % tracks.length);
  };

  const setVolumeValue = (value: number) => {
    const nextVolume = Math.min(1, Math.max(0, value / 100));
    volumeRef.current = nextVolume;
    setVolume(nextVolume);

    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
    }
  };

  const volumePercent = Math.round(volume * 100);
  const progressMax = duration > 0 ? duration : 100;
  const progressValue = duration > 0 ? currentTime : 0;
  const canSeek = duration > 0;

  return (
    <div className="music" aria-label="音乐播放器">
      <div className="flex items-baseline justify-between gap-3">
        <p className="label label--cjk">正在播放</p>
        <span className="meta shrink-0">
          {isPlaying ? "播放中" : isReady ? "已暂停" : "加载中"}
        </span>
      </div>

      <div className="music__now">
        <TrackCover
          track={currentTrack}
          className="music__cover"
          fallbackClassName="music__cover"
        />
        <div className="min-w-0 flex-1">
          <p className="music__title" title={currentTrack.title}>
            {currentTrack.title}
          </p>
          <p className="music__artist" title={currentTrack.artist}>
            {currentTrack.artist}
          </p>
        </div>
      </div>

      <div className="music__progress">
        <input
          ref={rangeRef}
          className="music-progress-slider w-full cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-50"
          type="range"
          min="0"
          max={progressMax}
          value={progressValue}
          step="any"
          disabled={!canSeek}
          onPointerDown={beginSeek}
          onPointerUp={(event) => endSeek(Number(event.currentTarget.value))}
          onPointerCancel={() => {
            isSeekingRef.current = false;
          }}
          onInput={(event) => seek(Number(event.currentTarget.value))}
          onChange={(event) => endSeek(Number(event.currentTarget.value))}
          style={{ "--music-progress": `${progress}%` } as CSSProperties}
          aria-label="播放进度"
        />
        <div className="flex items-center justify-between">
          <span className="meta">{formatTime(currentTime)}</span>
          <span className="meta">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="music__transport">
        <div className="music__group">
          <button
            className="music__btn"
            type="button"
            onClick={() => moveTrack(-1)}
            aria-label="上一首"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 5v14M18 6.5 9 12l9 5.5v-11Z" fill="currentColor" />
            </svg>
          </button>
          <button
            className="music__btn music__btn--play"
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" fill="currentColor" />
              </svg>
            ) : (
              <svg className="music__btn-play-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            className="music__btn"
            type="button"
            onClick={() => moveTrack(1)}
            aria-label="下一首"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 5v14M6 6.5l9 5.5-9 5.5v-11Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <button
          className="music__list-toggle"
          type="button"
          onClick={() => setIsPlaylistOpen((value) => !value)}
          aria-label={isPlaylistOpen ? "折叠播放列表" : "展开播放列表"}
          aria-expanded={isPlaylistOpen}
        >
          <span className="meta">{String(tracks.length).padStart(2, "0")}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 7h11M4 12h11M4 17h7"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          </svg>
        </button>
      </div>

      <div className="music__volume">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M11 5 6 9H3v6h3l5 4V5Zm4.73 2.5a1 1 0 0 1 1.41 0 6.5 6.5 0 0 1 0 9.19 1 1 0 1 1-1.41-1.41 4.5 4.5 0 0 0 0-6.37 1 1 0 0 1 0-1.41Z"
            fill="currentColor"
          />
        </svg>
        <input
          className="music-progress-slider music-progress-slider--mini min-w-0 flex-1 cursor-pointer outline-none"
          type="range"
          min="0"
          max="100"
          value={volumePercent}
          step="1"
          onInput={(event) => setVolumeValue(Number(event.currentTarget.value))}
          onChange={(event) => setVolumeValue(Number(event.currentTarget.value))}
          style={{ "--music-progress": `${volumePercent}%` } as CSSProperties}
          aria-label="音量"
        />
      </div>

      {isPlaylistOpen && (
        <ol className="music__list scrollbar-thin" aria-label="播放列表">
          {tracks.map((track, index) => {
            const isActive = index === currentTrackIndex;

            return (
              <li key={track.src}>
                <button
                  className="music__item"
                  type="button"
                  data-active={isActive ? "true" : undefined}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => selectTrack(index)}
                  title={`${track.title} — ${track.artist}`}
                >
                  <span className="music__index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="music__name">{track.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <style>{`
        .music__now {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.9rem;
        }

        .music__cover {
          width: 2.75rem;
          height: 2.75rem;
          flex-shrink: 0;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          object-fit: cover;
        }

        .music__title {
          overflow: hidden;
          margin: 0;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.45;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .music__artist {
          overflow: hidden;
          margin: 0.15rem 0 0;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .music__progress {
          margin-top: 0.75rem;
        }

        .music__transport {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .music__group {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          margin-left: -0.35rem;
        }

        .music__btn {
          display: grid;
          width: 1.9rem;
          height: 1.9rem;
          place-items: center;
          border: 0;
          border-radius: 4px;
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          touch-action: manipulation;
          transition: color 0.2s ease, background-color 0.2s ease;
        }

        .music__btn svg {
          width: 0.9rem;
          height: 0.9rem;
        }

        .music__btn:hover {
          background: color-mix(in srgb, var(--color-primary) 14%, transparent);
          color: var(--color-text-primary);
        }

        .music__btn--play {
          width: 2.15rem;
          height: 2.15rem;
          border: 1px solid color-mix(in srgb, var(--color-accent) 42%, transparent);
          border-radius: 999px;
          color: var(--color-accent);
        }

        .music__btn--play:hover {
          background: color-mix(in srgb, var(--color-accent) 12%, transparent);
          color: var(--color-accent);
        }

        .music__btn--play svg {
          width: 0.8rem;
          height: 0.8rem;
        }

        .music__btn-play-icon {
          margin-left: 0.1rem;
        }

        .music__list-toggle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          border: 0;
          border-radius: 4px;
          background: transparent;
          padding: 0.35rem 0.3rem;
          color: var(--color-text-muted);
          cursor: pointer;
          touch-action: manipulation;
          transition: color 0.2s ease;
        }

        .music__list-toggle svg {
          width: 0.85rem;
          height: 0.85rem;
        }

        .music__list-toggle:hover,
        .music__list-toggle[aria-expanded="true"] {
          color: var(--color-accent);
        }

        .music__list-toggle:hover .meta,
        .music__list-toggle[aria-expanded="true"] .meta {
          color: inherit;
        }

        .music__volume {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin-top: 0.35rem;
        }

        .music__volume svg {
          width: 0.8rem;
          height: 0.8rem;
          flex-shrink: 0;
          color: var(--color-text-muted);
        }

        .music__list {
          max-height: 11rem;
          overflow-y: auto;
          margin: 0.9rem 0 0;
          border-top: 1px solid var(--color-border);
          padding: 0.6rem 0 0;
          list-style: none;
        }

        .music__item {
          display: grid;
          width: 100%;
          grid-template-columns: 1.4rem minmax(0, 1fr);
          align-items: baseline;
          gap: 0.55rem;
          border: 0;
          border-radius: 4px;
          background: transparent;
          padding: 0.35rem 0.3rem;
          color: var(--color-text-secondary);
          font: inherit;
          text-align: left;
          cursor: pointer;
          touch-action: manipulation;
          transition: color 0.2s ease, background-color 0.2s ease;
        }

        .music__item:hover {
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
          color: var(--color-text-primary);
        }

        .music__item[data-active="true"] {
          color: var(--color-accent);
        }

        .music__index {
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-variant-numeric: tabular-nums;
        }

        .music__item[data-active="true"] .music__index {
          color: var(--color-accent);
        }

        .music__name {
          overflow: hidden;
          font-size: 0.8125rem;
          line-height: 1.5;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Roomier hit areas inside the mobile assist panel. */
        @media (max-width: 820px) {
          .music__btn {
            width: 2.6rem;
            height: 2.6rem;
          }

          .music__btn--play {
            width: 2.9rem;
            height: 2.9rem;
          }

          .music__btn svg {
            width: 1rem;
            height: 1rem;
          }

          .music__list-toggle {
            padding: 0.7rem 0.5rem;
          }

          .music__item {
            padding: 0.6rem 0.35rem;
          }

          .music__list {
            max-height: 14rem;
          }
        }
      `}</style>
    </div>
  );
}
