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

interface CrystalPulseSceneProps {
  audioDataRef: AudioDataRef;
  isPlaying: boolean;
}

const CRYSTAL_COUNT = 15;

export default function CrystalPulseScene({ audioDataRef, isPlaying }: CrystalPulseSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const crystalsRef = useRef<THREE.Mesh[]>([]);
  const beatTimeRef = useRef(0);
  const isBrokenRef = useRef(false);

  // Create crystals
  const crystals = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.5, 0),
      new THREE.DodecahedronGeometry(0.4, 0),
    ];

    // Rainbow colors
    const colors = [
      '#ff0000', '#ff7700', '#ffff00', '#00ff00',
      '#00ffff', '#0000ff', '#7700ff', '#ff00ff',
    ];

    for (let i = 0; i < CRYSTAL_COUNT; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colors[i % colors.length]),
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color(colors[i % colors.length]),
        emissiveIntensity: 0.3,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Position in a sphere
      const theta = (i / CRYSTAL_COUNT) * Math.PI * 2;
      const phi = Math.acos(2 * (i / CRYSTAL_COUNT) - 1);
      const radius = 1.5 + Math.random() * 1;

      mesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      mesh.userData = {
        baseScale: 0.5 + Math.random() * 0.5,
        rotationSpeed: 0.3 + Math.random() * 0.5,
        orbitRadius: radius,
        orbitSpeed: 0.2 + Math.random() * 0.3,
        orbitPhase: Math.random() * Math.PI * 2,
        colorIndex: i % colors.length,
        originalPosition: mesh.position.clone(),
        brokenOffset: new THREE.Vector3(),
      };

      meshes.push(mesh);
    }

    return meshes;
  }, []);

  useMemo(() => {
    crystalsRef.current = crystals;
  }, [crystals]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const audio = audioDataRef.current;
    const time = state.clock.elapsedTime;

    // Beat detection - trigger break/reform effect
    if (audio.beat && !isBrokenRef.current) {
      isBrokenRef.current = true;
      beatTimeRef.current = 0;
    }

    if (isBrokenRef.current) {
      beatTimeRef.current += delta;
      if (beatTimeRef.current > 0.5) {
        isBrokenRef.current = false;
      }
    }

    // Update each crystal
    crystalsRef.current.forEach((mesh, i) => {
      if (!mesh || !mesh.material) return;

      const ud = mesh.userData;

      // Rotation based on mid frequency
      const rotationMultiplier = isPlaying ? 1 + audio.mid * 4 : 0.2;
      mesh.rotation.x += delta * ud.rotationSpeed * rotationMultiplier;
      mesh.rotation.y += delta * ud.rotationSpeed * rotationMultiplier * 0.7;
      mesh.rotation.z += delta * ud.rotationSpeed * rotationMultiplier * 0.5;

      // Orbit movement
      const orbitAngle = time * ud.orbitSpeed + ud.orbitPhase;
      const orbitRadius = ud.orbitRadius * (isPlaying ? 1 + audio.bass * 0.3 : 1);

      mesh.position.x = orbitRadius * Math.cos(orbitAngle);
      mesh.position.y = orbitRadius * Math.sin(orbitAngle * 0.7) + Math.sin(time + i) * 0.2;
      mesh.position.z = orbitRadius * Math.sin(orbitAngle * 0.5);

      // Beat causes break/reform effect
      if (isBrokenRef.current) {
        const breakDirection = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();

        ud.brokenOffset.add(breakDirection.multiplyScalar(delta * 3));
        mesh.position.add(ud.brokenOffset);
      } else {
        // Slowly return to original position
        ud.brokenOffset.multiplyScalar(0.9);
      }

      // Bass affects scale (pulsing)
      const baseScale = ud.baseScale;
      const bassScale = baseScale * (1 + audio.bass * 0.6);
      const beatScale = isBrokenRef.current ? 1.5 : 1;
      mesh.scale.setScalar(bassScale * beatScale);

      // Treble affects emissive intensity (glow)
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      const emissiveIntensity = isPlaying ? 0.2 + audio.treble * 1.5 : 0.1;
      mat.emissiveIntensity = emissiveIntensity;

      // Transparency based on energy
      mat.opacity = isPlaying ? 0.7 + audio.energy * 0.3 : 0.4;
    });

    // Group rotation
    groupRef.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={groupRef}>
      {crystals.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </group>
  );
}
