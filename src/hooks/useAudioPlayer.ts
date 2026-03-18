import { useRef, useCallback, useState, useEffect } from 'react';

export interface AudioTrack {
  name: string;
  duration: number;
  url: string;
}

/**
 * Hook for managing audio playback
 * Provides play/pause, seek, and volume controls
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Create audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    // Event listeners
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []);

  /**
   * Load audio from URL or File
   */
  const loadAudio = useCallback(async (file: File | string) => {
    if (!audioRef.current) return;

    // Stop current playback
    audioRef.current.pause();
    setIsPlaying(false);

    if (typeof file === 'string') {
      // Load from URL
      audioRef.current.src = file;
      setTrack({ name: 'Sample Track', duration: 0, url: file });
    } else {
      // Load from File
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setTrack({ name: file.name, duration: 0, url });
    }

    setIsLoaded(false);
    setCurrentTime(0);

    try {
      await audioRef.current.load();
    } catch (error) {
      console.error('Failed to load audio:', error);
    }
  }, []);

  /**
   * Play audio
   */
  const play = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, []);

  /**
   * Pause audio
   */
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  /**
   * Seek to specific time
   */
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
  }, [duration]);

  /**
   * Set volume (0-1)
   */
  const setVolume = useCallback((value: number) => {
    if (!audioRef.current) return;
    const vol = Math.max(0, Math.min(1, value));
    audioRef.current.volume = vol;
    setVolumeState(vol);
  }, []);

  /**
   * Get the audio element (for connecting to analyzer)
   */
  const getAudioElement = useCallback(() => {
    return audioRef.current;
  }, []);

  return {
    loadAudio,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    getAudioElement,
    isPlaying,
    currentTime,
    duration,
    volume,
    track,
    isLoaded,
  };
}
