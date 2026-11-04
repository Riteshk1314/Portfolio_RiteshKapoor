import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Particles() {
    const ref = useRef();
    const positions = useMemo(() => {
        const arr = new Float32Array(500 * 3);
        for (let i = 0; i < 500; i++) {
            const r = 2.6 + Math.random() * 2.6;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            arr[i * 3 + 2] = r * Math.cos(phi);
        }
        return arr;
    }, []);
    useFrame((_, delta) => {
        ref.current.rotation.y -= delta * 0.05;
    });
    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#38BDF8"
                transparent
                opacity={0.7}
                sizeAttenuation
            />
        </points>
    );
}

function Rig({ children }) {
    const group = useRef();
    useFrame((state, delta) => {
        const g = group.current;
        g.rotation.y += delta * 0.12;
        g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, state.pointer.y * 0.3, 0.04);
        g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, state.pointer.x * 0.12, 0.04);
    });
    return <group ref={group}>{children}</group>;
}

function Scene() {
    return (
        <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
            <Rig>
                <mesh>
                    <icosahedronGeometry args={[1.7, 1]} />
                    <meshStandardMaterial
                        wireframe
                        color="#38BDF8"
                        emissive="#0ea5e9"
                        emissiveIntensity={0.6}
                        transparent
                        opacity={0.5}
                    />
                </mesh>
                <mesh scale={0.38}>
                    <icosahedronGeometry args={[1.7, 0]} />
                    <meshStandardMaterial
                        color="#0F111A"
                        emissive="#F59E0B"
                        emissiveIntensity={0.18}
                        roughness={0.15}
                        metalness={0.9}
                        flatShading
                    />
                </mesh>
                <Particles />
            </Rig>
        </Float>
    );
}

export default function HeroCanvas() {
    return (
        <Canvas
            camera={{ position: [0, 0, typeof window !== "undefined" && window.innerWidth < 640 ? 7.2 : 5.2], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
        >
            <ambientLight intensity={0.3} />
            <pointLight position={[4, 3, 4]} intensity={60} color="#38BDF8" />
            <pointLight position={[-4, -2, -3]} intensity={40} color="#F59E0B" />
            <Scene />
        </Canvas>
    );
}
