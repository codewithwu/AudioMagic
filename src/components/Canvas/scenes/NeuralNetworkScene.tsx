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

interface NeuralNetworkSceneProps {
  audioDataRef: AudioDataRef;
  isPlaying: boolean;
}

const NODE_COUNT = 80;
const CONNECTION_DISTANCE = 1.8;

export default function NeuralNetworkScene({ audioDataRef, isPlaying }: NeuralNetworkSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const nodePositionsRef = useRef<Float32Array | null>(null);
  const nodeVelocitiesRef = useRef<Float32Array | null>(null);

  // Create nodes and connections
  const { nodeGeometry, lineGeometry, positions, velocities } = useMemo(() => {
    // Node positions
    const positions = new Float32Array(NODE_COUNT * 3);
    const velocities = new Float32Array(NODE_COUNT * 3);

    // Initialize nodes in a spherical distribution
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1.5 + Math.random() * 1.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    // Node geometry
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create initial line connections
    const linePositions: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    return {
      nodeGeometry: nodeGeo,
      lineGeometry: lineGeo,
      positions,
      velocities,
    };
  }, []);

  useMemo(() => {
    nodePositionsRef.current = positions;
    nodeVelocitiesRef.current = velocities;
  }, [positions, velocities]);

  const nodeMatRef = useRef<THREE.PointsMaterial>(null);
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame((state, delta) => {
    if (!nodesRef.current || !linesRef.current) return;

    const audio = audioDataRef.current;
    const time = state.clock.elapsedTime;

    const posArray = nodePositionsRef.current!;
    const velArray = nodeVelocitiesRef.current!;

    // Update node positions
    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;

      // Beat causes nodes to jump
      const beatJump = audio.beat ? (Math.random() - 0.5) * 0.2 : 0;

      // Apply velocity
      const speedMultiplier = isPlaying ? 1 + audio.mid * 2 : 0.3;
      posArray[i3] += velArray[i3] * speedMultiplier + beatJump;
      posArray[i3 + 1] += velArray[i3 + 1] * speedMultiplier + beatJump;
      posArray[i3 + 2] += velArray[i3 + 2] * speedMultiplier + beatJump;

      // Boundary constraint - keep nodes in sphere
      const dist = Math.sqrt(
        posArray[i3] ** 2 + posArray[i3 + 1] ** 2 + posArray[i3 + 2] ** 2
      );

      if (dist > 3) {
        const scale = 2.8 / dist;
        posArray[i3] *= scale;
        posArray[i3 + 1] *= scale;
        posArray[i3 + 2] *= scale;
        // Reverse velocity
        velArray[i3] *= -0.5;
        velArray[i3 + 1] *= -0.5;
        velArray[i3 + 2] *= -0.5;
      }

      // Add some wave motion based on bass
      if (isPlaying) {
        posArray[i3] += Math.sin(time + i * 0.1) * audio.bass * 0.01;
        posArray[i3 + 1] += Math.cos(time + i * 0.1) * audio.bass * 0.01;
      }
    }

    // Update node geometry
    nodesRef.current.geometry.attributes.position.needsUpdate = true;

    // Update connections based on new positions
    const linePositions: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Dynamic connection distance based on bass
        const connectDist = CONNECTION_DISTANCE * (isPlaying ? 1 + audio.bass * 0.5 : 0.5);

        if (dist < connectDist) {
          linePositions.push(
            posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2],
            posArray[j * 3], posArray[j * 3 + 1], posArray[j * 3 + 2]
          );
        }
      }
    }

    // Update line geometry
    linesRef.current.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    linesRef.current.geometry.attributes.position.needsUpdate = true;

    // Update materials
    if (nodeMatRef.current) {
      nodeMatRef.current.size = isPlaying ? 0.08 + audio.treble * 0.08 : 0.04;
      nodeMatRef.current.opacity = isPlaying ? 0.9 : 0.4;
    }

    if (lineMatRef.current) {
      lineMatRef.current.opacity = isPlaying ? 0.3 + audio.energy * 0.5 : 0.1;
    }

    // Group rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={nodesRef} geometry={nodeGeometry}>
        <pointsMaterial
          ref={nodeMatRef}
          size={0.1}
          color="#00ffff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          ref={lineMatRef}
          color="#8800ff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
