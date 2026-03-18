import { BASS_RANGE, MID_RANGE, TREBLE_RANGE } from './constants';

/**
 * Extract bass (low frequency) average from frequency data
 * @param frequencyData - Uint8Array from AnalyserNode.getByteFrequencyData()
 * @returns Normalized value 0-1
 */
export function getBass(frequencyData: Uint8Array): number {
  let sum = 0;
  for (let i = BASS_RANGE.start; i < BASS_RANGE.end; i++) {
    sum += frequencyData[i];
  }
  const avg = sum / (BASS_RANGE.end - BASS_RANGE.start);
  return avg / 255;
}

/**
 * Extract mid frequency average from frequency data
 * @param frequencyData - Uint8Array from AnalyserNode.getByteFrequencyData()
 * @returns Normalized value 0-1
 */
export function getMid(frequencyData: Uint8Array): number {
  let sum = 0;
  for (let i = MID_RANGE.start; i < MID_RANGE.end; i++) {
    sum += frequencyData[i];
  }
  const avg = sum / (MID_RANGE.end - MID_RANGE.start);
  return avg / 255;
}

/**
 * Extract treble (high frequency) average from frequency data
 * @param frequencyData - Uint8Array from AnalyserNode.getByteFrequencyData()
 * @returns Normalized value 0-1
 */
export function getTreble(frequencyData: Uint8Array): number {
  let sum = 0;
  const end = Math.min(TREBLE_RANGE.end, frequencyData.length);
  for (let i = TREBLE_RANGE.start; i < end; i++) {
    sum += frequencyData[i];
  }
  const avg = sum / (end - TREBLE_RANGE.start);
  return avg / 255;
}

/**
 * Get overall energy/average volume from frequency data
 * @param frequencyData - Uint8Array from AnalyserNode.getByteFrequencyData()
 * @returns Normalized value 0-1
 */
export function getEnergy(frequencyData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }
  return sum / (frequencyData.length * 255);
}

/**
 * Audio data interface
 */
export interface AudioData {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
  beat: boolean;
}

/**
 * Extract all audio data from frequency array
 * @param frequencyData - Uint8Array from AnalyserNode.getByteFrequencyData()
 * @param beatDetected - Whether a beat was detected this frame
 * @returns AudioData object with normalized values
 */
export function extractAudioData(frequencyData: Uint8Array, beatDetected: boolean): AudioData {
  return {
    bass: getBass(frequencyData),
    mid: getMid(frequencyData),
    treble: getTreble(frequencyData),
    energy: getEnergy(frequencyData),
    beat: beatDetected,
  };
}
