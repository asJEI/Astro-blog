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

const BACKGROUND_VOLUME = 0.25;

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

const getAdaptiveTitleSize = (title: string, variant: "now-playing" | "playlist") => {
  const length = Math.max(title.length, 1);
  const max = variant === "now-playing" ? 1.25 : 1;
  const min = variant === "now-playing" ? 0.6875 : 0.75;
  const availableWidth = variant === "now-playing" ? 5.5 : 8;

  return `${Math.max(min, Math.min(max, (availableWidth / length) * 0.95))}rem`;
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rangeRef = useRef<HTMLInputElement | null>(null);
  const hasAutoPlayedRef = useRef(false);
  const shouldAutoPlayRef = useRef(false);
  const volumeRef = useRef(BACKGROUND_VOLUME);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(BACKGROUND_VOLUME);
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

  useEffect(() => {
    const audio = new Audio(currentTrack.src);
    audio.preload = "metadata";
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

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsReady(true);

      if (shouldAutoPlayRef.current) {
        shouldAutoPlayRef.current = false;
        tryPlay();
        return;
      }

      if (!hasAutoPlayedRef.current && currentTrackIndex === 0) {
        hasAutoPlayedRef.current = true;
        tryPlay();
      }
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setCurrentTime(0);
      shouldAutoPlayRef.current = true;
      setCurrentTrackIndex((index) => (index + 1) % tracks.length);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.pause();
      document.removeEventListener("pointerdown", resumeOnInteraction);
      document.removeEventListener("keydown", resumeOnInteraction);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
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
    if (!audio || !duration) {
      return;
    }

    audio.currentTime = value;
    setCurrentTime(value);
  };

  const selectTrack = (index: number) => {
    if (index === currentTrackIndex) {
      return;
    }

    shouldAutoPlayRef.current = isPlaying;
    setCurrentTrackIndex(index);
  };

  const moveTrack = (direction: 1 | -1) => {
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

  return (
    <div className="grid min-w-0 gap-4 max-sm:gap-3" aria-label="音乐播放器">
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-xs font-bold uppercase leading-none tracking-[0.12em] text-text-muted dark:text-text-muted-dark">
            音乐时间
          </p>
          <span className="shrink-0 rounded-pill border border-primary/16 bg-primary/8 px-2.5 py-1 text-[0.68rem] font-medium leading-none text-text-muted dark:border-primary/18 dark:bg-primary/10 dark:text-text-muted-dark">
            {isPlaying ? "播放中" : isReady ? "已暂停" : "加载中"}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p
              className="music-player-title m-0 truncate font-bold leading-tight tracking-[-0.04em]"
              style={{ fontSize: getAdaptiveTitleSize(currentTrack.title, "now-playing") }}
              title={currentTrack.title}
            >
              {currentTrack.title}
            </p>
            <p className="mt-1 truncate text-xs leading-5 text-text-muted dark:text-text-muted-dark" title={currentTrack.artist}>
              {currentTrack.artist}
            </p>
          </div>
          <div className="flex w-[5.75rem] shrink-0 items-center gap-1.5 self-center">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-text-muted dark:text-text-muted-dark"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M11 5 6 9H3v6h3l5 4V5Zm4.73 2.5a1 1 0 0 1 1.41 0 6.5 6.5 0 0 1 0 9.19 1 1 0 1 1-1.41-1.41 4.5 4.5 0 0 0 0-6.37 1 1 0 0 1 0-1.41Zm2.12-2.12a1 1 0 0 1 1.41 0 10.5 10.5 0 0 1 0 14.84 1 1 0 1 1-1.41-1.41 8.5 8.5 0 0 0 0-12.02 1 1 0 0 1 0-1.41Z"
                fill="currentColor"
              />
            </svg>
            <input
              className="music-progress-slider music-player-volume min-w-0 flex-1 cursor-pointer outline-none"
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
        </div>
      </div>

      <div className="flex items-center gap-3 max-[360px]:grid max-[360px]:grid-cols-[3.5rem_minmax(0,1fr)]">
        <TrackCover
          track={currentTrack}
          className="h-14 w-14 shrink-0 rounded-card border border-primary/18 object-cover shadow-[0_14px_32px_rgb(0_0_0_/_0.12)] dark:border-primary/20"
          fallbackClassName="h-14 w-14 shrink-0 rounded-card border border-primary/18 shadow-[0_14px_32px_rgb(0_0_0_/_0.12)] dark:border-primary/20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-[0.68rem] font-medium leading-none text-text-muted dark:text-text-muted-dark">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            ref={rangeRef}
            className="music-progress-slider mt-2 w-full cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-60"
            type="range"
            min="0"
            max={duration || 0}
            value={duration ? currentTime : 0}
            step="1"
            disabled={!duration}
            onInput={(event) => seek(Number(event.currentTarget.value))}
            onChange={(event) => seek(Number(event.currentTarget.value))}
            style={{ "--music-progress": `${progress}%` } as CSSProperties}
            aria-label="播放进度"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 max-[360px]:grid-cols-4">
        <button
          className="grid min-h-12 touch-manipulation place-items-center rounded-card border border-transparent text-text-muted transition duration-200 hover:-translate-y-px hover:bg-primary/8 hover:text-text-primary dark:text-text-muted-dark dark:hover:bg-white/8 dark:hover:text-text-primary-dark"
          type="button"
          onClick={() => moveTrack(-1)}
          aria-label="上一首"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 5v14M18 6.5 9 12l9 5.5v-11Z" fill="currentColor" />
          </svg>
        </button>
        <button
          className="grid h-14 w-14 touch-manipulation place-items-center rounded-pill border border-accent/18 bg-accent/16 text-accent transition duration-200 hover:-translate-y-px hover:bg-accent/22 dark:border-accent/24 dark:bg-accent/18 max-[360px]:h-12 max-[360px]:w-12"
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" fill="currentColor" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          className="grid min-h-12 touch-manipulation place-items-center rounded-card border border-transparent text-text-muted transition duration-200 hover:-translate-y-px hover:bg-primary/8 hover:text-text-primary dark:text-text-muted-dark dark:hover:bg-white/8 dark:hover:text-text-primary-dark"
          type="button"
          onClick={() => moveTrack(1)}
          aria-label="下一首"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 5v14M6 6.5l9 5.5-9 5.5v-11Z" fill="currentColor" />
          </svg>
        </button>
        <button
          className="grid min-h-12 touch-manipulation place-items-center rounded-card border border-transparent text-text-muted transition duration-200 hover:-translate-y-px hover:bg-primary/8 hover:text-accent dark:text-text-muted-dark dark:hover:bg-white/8 dark:hover:text-accent"
          type="button"
          onClick={() => setIsPlaylistOpen((value) => !value)}
          aria-label={isPlaylistOpen ? "折叠播放列表" : "展开播放列表"}
          aria-expanded={isPlaylistOpen}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 7h10M4 12h10M4 17h6m8-9v7.5a2.5 2.5 0 1 1-1.2-2.14V8h3.7V6H18Z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      {isPlaylistOpen && (
        <div className="max-h-40 overflow-y-auto border-t border-border pt-3 pr-1 scrollbar-thin dark:border-border-dark sm:max-h-44" aria-label="播放列表">
          <div className="grid gap-1">
            {tracks.map((track, index) => {
              const isActive = index === currentTrackIndex;

              return (
                <button
                  className={`grid min-h-12 touch-manipulation grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 rounded-card px-2 py-2 text-left transition duration-200 ${
                    isActive
                      ? "bg-accent/10 text-text-primary dark:bg-accent/14 dark:text-text-primary-dark"
                      : "text-text-secondary hover:bg-primary/8 hover:text-text-primary dark:text-text-secondary-dark dark:hover:bg-white/8 dark:hover:text-text-primary-dark"
                  }`}
                  type="button"
                  key={track.src}
                  onClick={() => selectTrack(index)}
                >
                  <TrackCover
                    track={track}
                    className="h-8 w-8 rounded-card object-cover"
                    fallbackClassName="h-8 w-8 rounded-card"
                  />
                  <span className="min-w-0 overflow-hidden">
                    <span
                      className="music-player-title block truncate font-bold leading-tight"
                      style={{ fontSize: getAdaptiveTitleSize(track.title, "playlist") }}
                      title={track.title}
                    >
                      {track.title}
                    </span>
                    <span className="block truncate text-xs leading-5 text-text-muted dark:text-text-muted-dark" title={track.artist}>
                      {track.artist}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        .music-player-title {
          max-width: 100%;
        }

        .music-player-volume {
          height: 1.25rem;
        }

        .music-player-volume::-webkit-slider-thumb {
          width: 0.75rem;
          height: 0.75rem;
          margin-top: -0.21875rem;
        }

        .music-player-volume::-moz-range-thumb {
          width: 0.65rem;
          height: 0.65rem;
        }
      `}</style>
    </div>
  );
}
