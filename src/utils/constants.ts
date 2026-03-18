// Audio analysis constants
export const FFT_SIZE = 2048;
export const SMOOTHING = 0.8;

// Frequency band ranges (in FFT bins)
export const BASS_RANGE = { start: 0, end: 10 };     // ~0-430Hz
export const MID_RANGE = { start: 10, end: 100 };    // ~430-4300Hz
export const TREBLE_RANGE = { start: 100, end: 512 }; // ~4300-22050Hz

// File upload constraints
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
export const ALLOWED_EXTENSIONS = ['.mp3', '.wav'];

// Visualization constraints
export const MAX_PARTICLES = 5000;
export const MIN_PARTICLES = 1000;

// Beat detection
export const BEAT_THRESHOLD = 1.3; // Energy threshold multiplier
export const BEAT_HISTORY_LENGTH = 43; // ~0.7 seconds at 60fps
