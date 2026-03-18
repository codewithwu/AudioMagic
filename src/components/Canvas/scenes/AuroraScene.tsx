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

interface AuroraSceneProps {
  audioDataRef: AudioDataRef;
  isPlaying: boolean;
}

const LAYER_COUNT = 12;

export default function AuroraScene({ audioDataRef, isPlaying }: AuroraSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const layersRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // Create aurora layers
  const layers = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    const auroraColors = [
      new THREE.Color('#00ff88'),  // 青绿
      new THREE.Color('#8800ff'),  // 紫罗兰
      new THREE.Color('#ff00aa'),  // 粉红
      new THREE.Color('#00ffcc'),  // 青
      new THREE.Color('#ff66ff'),  // 紫粉
      new THREE.Color('#66ffaa'),  // 绿青
    ];

    for (let i = 0; i < LAYER_COUNT; i++) {
      // Curved plane for aurora effect
      const geo = new THREE.PlaneGeometry(12, 6, 64, 32);

      const mat = new THREE.MeshBasicMaterial({
        color: auroraColors[i % auroraColors.length],
        transparent: true,
        opacity: 0.15 + (i * 0.02),
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Position layers in a curved arrangement
      mesh.position.z = -3 + i * 0.4;
      mesh.position.y = 1 + Math.sin(i * 0.5) * 0.5;
      mesh.rotation.x = -0.2 + Math.sin(i * 0.3) * 0.1;

      mesh.userData = {
        baseOpacity: 0.15 + (i * 0.02),
        waveSpeed: 0.3 + Math.random() * 0.3,
        waveAmplitude: 0.2 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        colorIndex: i % auroraColors.length,
        originalPositions: geo.attributes.position.array as Float32Array,
      };

      meshes.push(mesh);
    }

    return meshes;
  }, []);

  useMemo(() => {
    layersRef.current = layers;
  }, [layers]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const audio = audioDataRef.current;
    timeRef.current += delta;

    // Update each aurora layer
    layersRef.current.forEach((mesh, i) => {
      if (!mesh || !mesh.material || !mesh.geometry.attributes.position) return;

      const ud = mesh.userData;
      const time = timeRef.current;

      // Wave deformation based on bass and mid
      const positions = mesh.geometry.attributes.position;
      const original = ud.originalPositions;

      const waveSpeed = ud.waveSpeed * (isPlaying ? 1 + audio.mid * 2 : 0.3);
      const waveAmp = ud.waveAmplitude * (isPlaying ? 1 + audio.bass * 1.5 : 0.3);

      for (let j = 0; j < positions.count; j++) {
        const x = original[j * 3];
        const y = original[j * 3 + 1];

        // Complex wave pattern
        const wave1 = Math.sin(x * 0.5 + time * waveSpeed + ud.phase) * waveAmp;
        const wave2 = Math.sin(x * 0.3 + time * waveSpeed * 0.7 + ud.phase * 2) * waveAmp * 0.5;
        const wave3 = Math.cos(y * 0.8 + time * waveSpeed * 0.5) * waveAmp * 0.3;

        positions.array[j * 3 + 2] = wave1 + wave2 + wave3;
      }
      positions.needsUpdate = true;

      // Opacity based on treble (twinkling)
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const trebleBlink = isPlaying ? audio.treble * 0.15 : 0;
      mat.opacity = ud.baseOpacity + trebleBlink + Math.sin(time * 2 + i) * 0.02;

      // Gentle movement
      mesh.position.y = ud.waveAmplitude + Math.sin(time * 0.5 + ud.phase) * 0.2;

      // Color shift based on energy
      const hueShift = audio.energy * 0.1;
      const baseColor = new THREE.Color().setHSL((ud.colorIndex * 0.1 + hueShift) % 1, 0.8, 0.6);
      mat.color = baseColor;
    });

    // Overall gentle rotation
    groupRef.current.rotation.y = Math.sin(timeRef.current * 0.1) * 0.1;
  });

  // Add sparkles/highlights
  const sparkles = useMemo(() => {
    const sparkleGeo = new THREE.BufferGeometry();
    const sparkleCount = 200;
    const positions = new Float32Array(sparkleCount * 3);
    const sizes = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 4 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
      sizes[i] = Math.random();
    }

    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return sparkleGeo;
  }, []);

  const sparkleRef = useRef<THREE.Points>(null);
  const sparkleMatRef = useRef<THREE.PointsMaterial>(null);

  useFrame(() => {
    if (!sparkleRef.current || !sparkleMatRef.current) return;

    const audio = audioDataRef.current;

    // Sparkle intensity based on treble
    sparkleMatRef.current.opacity = isPlaying ? audio.treble * 0.8 : 0.1;
    sparkleMatRef.current.size = 0.02 + audio.treble * 0.03;
  });

  return (
    <group ref={groupRef}>
      {layers.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
      <points ref={sparkleRef} geometry={sparkles}>
        <pointsMaterial
          ref={sparkleMatRef}
          size={0.03}
          color="#ffffff"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
