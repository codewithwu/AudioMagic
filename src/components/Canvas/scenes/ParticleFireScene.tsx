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

interface ParticleFireSceneProps {
  audioDataRef: AudioDataRef;
  isPlaying: boolean;
}

const PARTICLE_COUNT = 3500;

export default function ParticleFireScene({ audioDataRef, isPlaying }: ParticleFireSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Create fire particle system
  const { geometry, velocities, lifetimes, initialPositions } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const lifetimes = new Float32Array(PARTICLE_COUNT);
    const initialPositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start from bottom center with some spread
      const x = (Math.random() - 0.5) * 1.5;
      const y = -2 + Math.random() * 0.5;
      const z = (Math.random() - 0.5) * 1.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;

      // Upward velocity with some randomness
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Random lifetime for staggered emission
      lifetimes[i] = Math.random();

      // Fire colors: red -> orange -> yellow
      const t = Math.random();
      if (t < 0.3) {
        // Red base
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.0;
      } else if (t < 0.6) {
        // Orange
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.0;
      } else if (t < 0.85) {
        // Yellow
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.0;
      } else {
        // Blue accent (for contrast)
        colors[i * 3] = 0.2 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i * 3 + 2] = 1.0;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { geometry: geo, velocities, lifetimes, initialPositions };
  }, []);

  const positionAttrRef = useRef(geometry.attributes.position);
  const beatRef = useRef(false);
  const beatTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current || !materialRef.current) return;

    const audio = audioDataRef.current;
    const positions = positionAttrRef.current.array as Float32Array;

    // Detect beat
    if (audio.beat && !beatRef.current) {
      beatRef.current = true;
      beatTimeRef.current = 0;
    }
    if (beatRef.current) {
      beatTimeRef.current += delta;
      if (beatTimeRef.current > 0.3) {
        beatRef.current = false;
      }
    }

    // Fire parameters based on audio
    const baseSpeed = isPlaying ? 1 + audio.energy * 2 : 0.3;
    const baseWidth = isPlaying ? 1 + audio.bass * 1.5 : 0.5;
    const beatExplosion = beatRef.current ? 2.5 : 1;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Update lifetime
      lifetimes[i] += delta * (0.3 + audio.mid * 0.5);

      // Reset particle when lifetime expires
      if (lifetimes[i] > 1 || positions[i3 + 1] > 3.5) {
        lifetimes[i] = 0;
        positions[i3] = initialPositions[i3] * baseWidth;
        positions[i3 + 1] = initialPositions[i3 + 1];
        positions[i3 + 2] = initialPositions[i3 + 2] * baseWidth;

        // Add some randomness to reset position
        positions[i3] += (Math.random() - 0.5) * 0.2;
        positions[i3 + 2] += (Math.random() - 0.5) * 0.2;
      }

      // Update velocity based on audio
      let vx = velocities[i3] * baseSpeed;
      let vy = velocities[i3 + 1] * baseSpeed * beatExplosion;
      let vz = velocities[i3 + 2] * baseSpeed;

      // Beat creates explosion effect
      if (beatRef.current) {
        vx += (Math.random() - 0.5) * 0.1;
        vz += (Math.random() - 0.5) * 0.1;
      }

      // Add some turbulence based on mid frequency
      const turbulence = audio.mid * 0.01;
      vx += Math.sin(state.clock.elapsedTime * 5 + i * 0.1) * turbulence;
      vz += Math.cos(state.clock.elapsedTime * 5 + i * 0.1) * turbulence;

      // Update position
      positions[i3] += vx;
      positions[i3 + 1] += vy;
      positions[i3 + 2] += vz;
    }

    positionAttrRef.current.needsUpdate = true;

    // Update material
    materialRef.current.opacity = isPlaying ? 0.7 + audio.treble * 0.3 : 0.3;
    materialRef.current.size = 0.04 + audio.energy * 0.04;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
