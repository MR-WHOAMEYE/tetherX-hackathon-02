import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Sky, Stars } from '@react-three/drei';
import HospitalScene from '../components/three/HospitalScene';
import FirstPersonControls from '../components/three/FirstPersonControls';
import DataOverlay from '../components/three/DataOverlay';
import { getDigitalTwinState } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DEPT_POSITIONS = [
    { name: 'Emergency', x: -14, z: -6, range: 5 },
    { name: 'ICU', x: 0, z: -6, range: 5 },
    { name: 'Cardiology', x: 14, z: -6, range: 5 },
    { name: 'Orthopedics', x: -14, z: 6, range: 5 },
    { name: 'Pediatrics', x: 0, z: 6, range: 5 },
    { name: 'Neurology', x: 14, z: 6, range: 5 },
];

export default function DigitalTwin3D() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [nearDepartment, setNearDepartment] = useState(null);
    const canvasContainerRef = useRef(null);

    useEffect(() => {
        getDigitalTwinState()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Listen for pointer lock changes
    useEffect(() => {
        const handler = () => {
            setIsLocked(!!document.pointerLockElement);
        };
        document.addEventListener('pointerlockchange', handler);
        return () => document.removeEventListener('pointerlockchange', handler);
    }, []);

    const handleEnterClick = useCallback(() => {
        // Find the canvas inside our container and request pointer lock
        const canvas = canvasContainerRef.current?.querySelector('canvas');
        if (canvas) {
            canvas.requestPointerLock();
        }
    }, []);

    const handleNearDepartment = useCallback((pos) => {
        let closest = null;
        let closestDist = Infinity;
        for (const dept of DEPT_POSITIONS) {
            const dx = pos.x - dept.x;
            const dz = pos.z - dept.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < dept.range && dist < closestDist) {
                closest = dept.name;
                closestDist = dist;
            }
        }
        setNearDepartment(closest);
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div
            ref={canvasContainerRef}
            style={{ position: 'relative', width: '100%', height: 'calc(100vh - 48px)', borderRadius: 16, overflow: 'hidden' }}
        >
            <Canvas
                shadows
                camera={{ fov: 75, near: 0.1, far: 200, position: [0, 2, 18] }}
                style={{ background: '#0f172a' }}
            >
                <Suspense fallback={null}>
                    <Sky sunPosition={[100, 20, 100]} turbidity={8} />
                    <Stars radius={100} depth={50} count={2000} factor={3} />

                    <ambientLight intensity={0.4} />
                    <directionalLight
                        position={[20, 30, 10]}
                        intensity={0.8}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                        shadow-camera-far={50}
                        shadow-camera-left={-30}
                        shadow-camera-right={30}
                        shadow-camera-top={20}
                        shadow-camera-bottom={-20}
                    />
                    <hemisphereLight intensity={0.3} groundColor="#1e293b" />

                    <fog attach="fog" args={['#1e293b', 30, 80]} />

                    <Physics gravity={[0, -9.81, 0]}>
                        <HospitalScene data={data} />
                        <FirstPersonControls
                            onNearDepartment={handleNearDepartment}
                            isLocked={isLocked}
                        />
                    </Physics>
                </Suspense>
            </Canvas>

            <DataOverlay
                isLocked={isLocked}
                nearDepartment={nearDepartment}
                data={data}
                onEnterClick={handleEnterClick}
            />
        </div>
    );
}

