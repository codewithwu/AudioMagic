import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import StarCloudScene from './scenes/StarCloudScene';
import AuroraScene from './scenes/AuroraScene';
import ParticleFireScene from './scenes/ParticleFireScene';
import CrystalPulseScene from './scenes/CrystalPulseScene';
import NeuralNetworkScene from './scenes/NeuralNetworkScene';
import BubbleGalaxyScene from './scenes/BubbleGalaxyScene';

export type VisualStyle = 'starcloud' | 'aurora' | 'fire' | 'crystal' | 'neural' | 'bubble';

interface VisualizationCanvasProps {
  getAudioData: () => {
    bass: number;
    mid: number;
    treble: number;
    energy: number;
    beat: boolean;
  };
  style: VisualStyle;
  isPlaying: boolean;
}

// Scene wrapper component
function SceneController({ getAudioData, style, isPlaying }: VisualizationCanvasProps) {
  const audioDataRef = useRef({ bass: 0, mid: 0, treble: 0, energy: 0, beat: false });

  useFrame(() => {
    audioDataRef.current = getAudioData();
  });

  switch (style) {
    case 'starcloud':
      return <StarCloudScene audioDataRef={audioDataRef} isPlaying={isPlaying} />;
    case 'aurora':
      return <AuroraScene audioDataRef={audioDataRef} isPlaying={isPlaying} />;
    case 'fire':
      return <ParticleFireScene audioDataRef={audioDataRef} isPlaying={isPlaying} />;
    case 'crystal':
      return <CrystalPulseScene audioDataRef={audioDataRef} isPlaying={isPlaying} />;
    case 'neural':
      return <NeuralNetworkScene audioDataRef={audioDataRef} isPlaying={isPlaying} />;
    case 'bubble':
      return <BubbleGalaxyScene audioDataRef={audioDataRef} isPlaying={isPlaying} />;
    default:
      return <StarCloudScene audioDataRef={audioDataRef} isPlaying={isPlaying} />;
  }
}

export default function VisualizationCanvas({ getAudioData, style, isPlaying }: VisualizationCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%)' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SceneController getAudioData={getAudioData} style={style} isPlaying={isPlaying} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
