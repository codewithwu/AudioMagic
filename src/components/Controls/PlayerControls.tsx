import { useCallback } from 'react';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onSeek,
  onVolumeChange,
}: PlayerControlsProps) {
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  }, [duration, onSeek]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  }, [onVolumeChange]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
    }}>
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePlay}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: isPlaying ? 'linear-gradient(135deg, #ff0066, #ff6600)' : 'linear-gradient(135deg, #00ffcc, #00ccff)',
          color: '#000',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          transition: 'transform 0.2s ease',
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Progress Bar */}
      <div>
        <div
          onClick={handleProgressClick}
          style={{
            height: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
              background: 'linear-gradient(90deg, #00ffcc, #00ccff)',
              borderRadius: '4px',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          color: '#888',
          fontSize: '12px',
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#888', fontSize: '16px' }}>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{
            flex: 1,
            height: '4px',
            appearance: 'none',
            background: `linear-gradient(90deg, #00ffcc ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}
