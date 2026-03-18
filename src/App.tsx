import { useState, useRef, useCallback, useEffect } from 'react';
import VisualizationCanvas from './components/Canvas/VisualizationCanvas';
import type { VisualStyle } from './components/Canvas/VisualizationCanvas';
import AudioUploader from './components/Upload/AudioUploader';
import PlayerControls from './components/Controls/PlayerControls';
import StyleSelector from './components/Panel/StyleSelector';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import './styles/global.css';

function App() {
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('starcloud');
  const [hasAudio, setHasAudio] = useState(false);
  const animationRef = useRef<number | null>(null);

  const {
    loadAudio,
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
  } = useAudioPlayer();

  const { initialize, resume, getAudioData } = useAudioAnalyzer();

  // Initialize audio analyzer when audio is loaded
  useEffect(() => {
    if (isLoaded && getAudioElement()) {
      initialize(getAudioElement()!);
    }
  }, [isLoaded, initialize, getAudioElement]);

  // Resume audio context on play
  const handlePlay = useCallback(async () => {
    await resume();
    togglePlay();
  }, [resume, togglePlay]);

  // Animation loop for continuous audio data
  useEffect(() => {
    const updateLoop = () => {
      getAudioData();
      animationRef.current = requestAnimationFrame(updateLoop);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, getAudioData]);

  const handleFileSelect = useCallback(async (file: File) => {
    await loadAudio(file);
    setHasAudio(true);
  }, [loadAudio]);

  const handleStyleChange = useCallback((style: VisualStyle) => {
    setVisualStyle(style);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>AudioMagic 🎵</h1>
        <p>将音乐转化为视觉艺术</p>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Visualization Canvas */}
        <div className="canvas-container">
          <VisualizationCanvas
            getAudioData={getAudioData}
            style={visualStyle}
            isPlaying={isPlaying}
          />

          {/* Welcome overlay when no audio */}
          {!hasAudio && (
            <div className="welcome-overlay">
              <div className="welcome-text">
                <span style={{ fontSize: '64px' }}>🎶</span>
                <h2>欢迎使用 AudioMagic</h2>
                <p>上传音乐，开始你的视觉之旅</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <aside className="control-panel">
          {/* Upload Section */}
          <AudioUploader onFileSelect={handleFileSelect} />

          {/* Track Info */}
          {track && (
            <div className="track-info">
              <span style={{ fontSize: '14px', color: '#888' }}>当前曲目</span>
              <div style={{ color: '#fff', fontSize: '16px', marginTop: '4px' }}>
                {track.name}
              </div>
            </div>
          )}

          {/* Style Selector */}
          <StyleSelector
            currentStyle={visualStyle}
            onStyleChange={handleStyleChange}
          />

          {/* Player Controls */}
          {hasAudio && (
            <PlayerControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              onTogglePlay={handlePlay}
              onSeek={seek}
              onVolumeChange={setVolume}
            />
          )}

          {/* Tips */}
          <div className="tips">
            <h4>💡 提示</h4>
            <ul>
              <li>低频(鼓点) → 控制粒子大小和背景色</li>
              <li>中频 → 控制运动速度</li>
              <li>高频 → 控制闪烁和透明度</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
