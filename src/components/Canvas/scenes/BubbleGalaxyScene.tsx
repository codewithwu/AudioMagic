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

interface BubbleGalaxySceneProps {
  audioDataRef: AudioDataRef;
  isPlaying: boolean;
}

const BUBBLE_COUNT = 150;

interface Bubble {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  wobblePhase: number;
  wobbleSpeed: number;
  baseSize: number;
}

export default function BubbleGalaxyScene({ audioDataRef, isPlaying }: BubbleGalaxySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const lastBeatTimeRef = useRef(0);

  // Create bubbles
  const bubbles = useMemo(() => {
    const bubbleArray: Bubble[] = [];
    const geometries = [
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.SphereGeometry(1, 24, 24),
      new THREE.SphereGeometry(1, 32, 32),
    ];

    // Macaron colors: pink, light blue, lavender, mint, peach
    const colors = [
      '#ffb3d9', // pink
      '#b3d9ff', // light blue
      '#d9b3ff', // lavender
      '#b3ffd9', // mint
      '#ffd9b3', // peach
      '#ffffb3', // yellow
    ];

    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colors[i % colors.length]),
        transparent: true,
        opacity: 0.4 + Math.random() * 0.3,
        roughness: 0,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 1,
        envMapIntensity: 1,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Random starting position at bottom
      mesh.position.set(
        (Math.random() - 0.5) * 6,
        -3 + Math.random() * 6,
        (Math.random() - 0.5) * 4
      );

      const baseSize = 0.1 + Math.random() * 0.25;
      mesh.scale.setScalar(baseSize);

      bubbleArray.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          0.02 + Math.random() * 0.03,
          (Math.random() - 0.5) * 0.01
        ),
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 1 + Math.random() * 2,
        baseSize,
      });
    }

    return bubbleArray;
  }, []);

  useMemo(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const audio = audioDataRef.current;
    const time = state.clock.elapsedTime;

    // Beat detection - spawn new bubbles
    if (audio.beat && time - lastBeatTimeRef.current > 0.2) {
      lastBeatTimeRef.current = time;

      // Reset some bubbles from bottom on beat
      bubblesRef.current.forEach((bubble) => {
        if (Math.random() < 0.3 && bubble.mesh.position.y > 1) {
          bubble.mesh.position.set(
            (Math.random() - 0.5) * 4,
            -3,
            (Math.random() - 0.5) * 3
          );
        }
      });
    }

    // Update each bubble
    bubblesRef.current.forEach((bubble, i) => {
      const { mesh, velocity, wobblePhase, wobbleSpeed, baseSize } = bubble;

      if (!mesh.material) return;
      const mat = mesh.material as THREE.MeshPhysicalMaterial;

      // Movement based on energy
      const speedMultiplier = isPlaying ? 1 + audio.energy * 1.5 : 0.3;

      // Upward movement with wobble
      mesh.position.y += velocity.y * speedMultiplier;
      mesh.position.x += velocity.x * speedMultiplier;
      mesh.position.z += velocity.z * speedMultiplier;

      // Wobble effect
      const wobble = Math.sin(time * wobbleSpeed + wobblePhase) * 0.01;
      mesh.position.x += wobble;
      mesh.position.z += Math.cos(time * wobbleSpeed + wobblePhase) * 0.01;

      // Size based on energy
      const targetSize = baseSize * (isPlaying ? 1 + audio.energy * 0.8 : 0.7);
      mesh.scale.setScalar(targetSize);

      // Reset when reaching top
      if (mesh.position.y > 4) {
        mesh.position.y = -3;
        mesh.position.x = (Math.random() - 0.5) * 5;
        mesh.position.z = (Math.random() - 0.5) * 3;
      }

      // Treble affects transparency (twinkling)
      const baseOpacity = 0.4 + i * 0.003;
      const trebleBlink = isPlaying ? audio.treble * 0.2 : 0;
      mat.opacity = Math.min(0.8, baseOpacity + trebleBlink);

      // Bass affects reflectivity
      mat.clearcoat = isPlaying ? 0.5 + audio.bass * 0.5 : 0.3;
    });

    // Gentle rotation
    groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      {bubbles.map((bubble, i) => (
        <primitive key={i} object={bubble.mesh} />
      ))}
    </group>
  );
}
