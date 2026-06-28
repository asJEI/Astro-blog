import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type Track = {
  title: string;
  artist: string;
  src: string;
  accent: string;
};

const tracks: Track[] = [
  {
    title: "Rain",
    artist: "Beihai Radio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    accent: "from-primary/40 to-warm/30",
  },
  {
    title: "Nocturne Notes",
    artist: "Quiet Tech Blog",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    accent: "from-accent/35 to-primary/30",
  },
  {
    title: "Late City Lights",
    artist: "Placeholder Session",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    accent: "from-warm/35 to-accent/25",
  },
];

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rangeRef = useRef<HTMLInputElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
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
    audioRef.current = audio;
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsReady(true);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
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
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
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
      await audio.play();
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

    setCurrentTrackIndex(index);
  };

  const moveTrack = (direction: 1 | -1) => {
    setCurrentTrackIndex((index) => (index + direction + tracks.length) % tracks.length);
  };

  return (
    <div className="grid gap-4" aria-label="音乐播放器">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold uppercase leading-none tracking-[0.12em] text-text-muted dark:text-text-muted-dark">
           音乐时间
          </p>
          <p className="mt-2 truncate text-base font-bold leading-6 tracking-[-0.04em]">
            {currentTrack.title}
          </p>
          <p className="mt-1 truncate text-xs leading-5 text-text-muted dark:text-text-muted-dark">
            {currentTrack.artist}
          </p>
        </div>
        <span className="rounded-pill border border-primary/16 bg-primary/8 px-2.5 py-1 text-[0.68rem] font-medium leading-none text-text-muted dark:border-primary/18 dark:bg-primary/10 dark:text-text-muted-dark">
          {isPlaying ? "播放中" : isReady ? "已暂停" : "加载中"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-card border border-primary/18 bg-gradient-to-br ${currentTrack.accent} shadow-[0_14px_32px_rgb(0_0_0_/_0.12)] dark:border-primary/20`}
          aria-hidden="true"
        >
          <span className="text-lg font-bold text-white/90">{currentTrack.title.slice(0, 1)}</span>
        </div>
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
            onChange={(event) => seek(Number(event.currentTarget.value))}
            style={{ "--music-progress": `${progress}%` } as CSSProperties}
            aria-label="播放进度"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
        <button
          className="grid min-h-11 place-items-center rounded-card border border-transparent text-text-muted transition duration-200 hover:-translate-y-px hover:bg-primary/8 hover:text-text-primary dark:text-text-muted-dark dark:hover:bg-white/8 dark:hover:text-text-primary-dark"
          type="button"
          onClick={() => moveTrack(-1)}
          aria-label="上一首"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 5v14M18 6.5 9 12l9 5.5v-11Z" fill="currentColor" />
          </svg>
        </button>
        <button
          className="grid h-14 w-14 place-items-center rounded-pill border border-accent/18 bg-accent/16 text-accent transition duration-200 hover:-translate-y-px hover:bg-accent/22 dark:border-accent/24 dark:bg-accent/18"
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
          className="grid min-h-11 place-items-center rounded-card border border-transparent text-text-muted transition duration-200 hover:-translate-y-px hover:bg-primary/8 hover:text-text-primary dark:text-text-muted-dark dark:hover:bg-white/8 dark:hover:text-text-primary-dark"
          type="button"
          onClick={() => moveTrack(1)}
          aria-label="下一首"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 5v14M6 6.5l9 5.5-9 5.5v-11Z" fill="currentColor" />
          </svg>
        </button>
        <button
          className="grid min-h-11 place-items-center rounded-card border border-transparent text-text-muted transition duration-200 hover:-translate-y-px hover:bg-primary/8 hover:text-accent dark:text-text-muted-dark dark:hover:bg-white/8 dark:hover:text-accent"
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
        <div className="max-h-44 overflow-y-auto border-t border-border pt-3 pr-1 scrollbar-thin dark:border-border-dark" aria-label="播放列表">
          <div className="grid gap-1">
            {tracks.map((track, index) => {
              const isActive = index === currentTrackIndex;

              return (
                <button
                  className={`grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 rounded-card px-2 py-2 text-left transition duration-200 ${
                    isActive
                      ? "bg-accent/10 text-text-primary dark:bg-accent/14 dark:text-text-primary-dark"
                      : "text-text-secondary hover:bg-primary/8 hover:text-text-primary dark:text-text-secondary-dark dark:hover:bg-white/8 dark:hover:text-text-primary-dark"
                  }`}
                  type="button"
                  key={track.src}
                  onClick={() => selectTrack(index)}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-card bg-gradient-to-br ${track.accent} text-xs font-bold text-white/90`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold leading-5">{track.title}</span>
                    <span className="block truncate text-xs leading-5 text-text-muted dark:text-text-muted-dark">
                      {track.artist}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
