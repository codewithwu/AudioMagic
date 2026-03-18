import { useRef, useCallback, useState, useEffect } from 'react';
import { FFT_SIZE, SMOOTHING, BEAT_THRESHOLD, BEAT_HISTORY_LENGTH } from '../utils/constants';

interface AudioData {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
  beat: boolean;
}

/**
 * Hook for Web Audio API audio analysis
 * Provides FFT frequency data and beat detection
 */
export function useAudioAnalyzer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const energyHistoryRef = useRef<number[]>([]);
  const isInitializedRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [_audioData, _setAudioData] = useState<AudioData>({
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
    beat: false,
  });

  /**
   * Initialize the audio analyzer with an HTMLAudioElement
   * Should be called when audio source is ready
   */
  const initialize = useCallback(async (audioElement: HTMLAudioElement) => {
    if (isInitializedRef.current) return;

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING;
      analyserRef.current = analyser;

      // Create source from audio element
      const source = audioContext.createMediaElementSource(audioElement);
      sourceRef.current = source;

      // Connect: source -> analyser -> destination
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Allocate frequency data array
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      isInitializedRef.current = true;
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
    }
  }, []);

  /**
   * Resume audio context (needed after user interaction)
   */
  const resume = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  /**
   * Get current audio data
   * Should be called in animation frame loop
   */
  const getAudioData = useCallback((): AudioData => {
    if (!analyserRef.current || !frequencyDataRef.current) {
      return { bass: 0, mid: 0, treble: 0, energy: 0, beat: false };
    }

    // Get frequency data
    const freqData = frequencyDataRef.current as Uint8Array<ArrayBuffer>;
    analyserRef.current.getByteFrequencyData(freqData);

    // Extract audio features
    const bass = freqData[0] / 255;
    const mid = freqData[50] / 255;
    const treble = freqData[200] / 255;

    // Beat detection using energy threshold
    const energy = (bass + mid + treble) / 3;
    const history = energyHistoryRef.current;
    history.push(energy);

    if (history.length > BEAT_HISTORY_LENGTH) {
      history.shift();
    }

    // Calculate average energy
    const avgEnergy = history.reduce((a, b) => a + b, 0) / history.length;
    const beatDetected = energy > avgEnergy * BEAT_THRESHOLD && energy > 0.3;

    return {
      bass,
      mid,
      treble,
      energy,
      beat: beatDetected,
    };
  }, []);

  /**
   * Set audio analysis smoothing
   */
  const setSmoothing = useCallback((value: number) => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = Math.max(0, Math.min(1, value));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    initialize,
    resume,
    getAudioData,
    setSmoothing,
    isReady,
    audioData: _audioData,
  };
}
