import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AudioDataRef {
  current: {
    bass: number;
    mid: number;
    treble: number;
    energy: number;
    beat: boolean;
  };
}

interface StarCloudSceneProps {
  audioDataRef: AudioDataRef;
  isPlaying: boolean;
}

const PARTICLE_COUNT = 3000;

export default function StarCloudScene({ audioDataRef, isPlaying }: StarCloudSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Create particle geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1 + Math.random() * 2;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Color: purple to cyan gradient
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        // Purple
        colors[i * 3] = 0.6 + Math.random() * 0.4;
        colors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      } else if (colorChoice < 0.66) {
        // Cyan
        colors[i * 3] = 0.2 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else {
        // Pink
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4;
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.4;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geo;
  }, []);

  useFrame((_state, delta) => {
    if (!pointsRef.current || !materialRef.current) return;

    const audio = audioDataRef.current;

    // Rotation based on mid frequency
    const rotationSpeed = 0.1 + audio.mid * 0.3;
    pointsRef.current.rotation.y += delta * rotationSpeed;
    pointsRef.current.rotation.x += delta * rotationSpeed * 0.3;

    // Bass affects scale (pulsing)
    const baseScale = 1;
    const bassScale = baseScale + audio.bass * 0.5;
    const beatScale = audio.beat ? 1.1 : 1;
    pointsRef.current.scale.setScalar(bassScale * beatScale);

    // Treble affects opacity (twinkling)
    const baseOpacity = 0.6;
    const trebleOpacity = baseOpacity + audio.treble * 0.4;
    materialRef.current.opacity = isPlaying ? trebleOpacity : 0.3;
    materialRef.current.transparent = true;

    // Size attenuation based on energy
    materialRef.current.size = 0.02 + audio.energy * 0.03;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
