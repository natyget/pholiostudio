"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, useBox, usePlane } from "@react-three/cannon";
import { Environment } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { MotionValue, useTransform } from "framer-motion";

// --- Types ---
interface PhotoProps {
  position: [number, number, number];
  rotation: [number, number, number];
  targetPosition: [number, number, number];
  scrollProgress: MotionValue<number>;
}

// --- Components ---

function Ground() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -10, 0] }));
  return <mesh ref={ref as any} visible={false} />;
}

const VECTOR = new THREE.Vector3();

function FloatingPhoto({ position, rotation, targetPosition, scrollProgress }: PhotoProps) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    rotation,
    args: [2.5, 3.5, 0.1], 
    linearDamping: 0.9, // High damping to stop them from swinging forever
    angularDamping: 0.9,
  }));

  useFrame((state) => {
    // Read the current scroll progress (0 to 1 for this section)
    const progress = scrollProgress.get();
    
    // Magnetic Phase: If progress > 0.2, start pulling to target
    if (progress > 0.1) {
      // Current position is managed by physics main loop, but we need it for force calculation.
      // Ideally we subscribe to position, but for simplicity in this prompt we'll assume the ref is updated or we just push blindly?
      // Actually with useBox, ref.current is the mesh, keeping track of visual pos.
      // But the physics body is separate.
      // We can use api.position.subscribe but that's expensive for many objects.
      
      // Better approach: "Kinematic" switch? No, we want physics feel.
      // We'll use a Hooke's law spring: F = -k * (x - target)
      
      // Get current position from the mesh ref (it's synced with physics body on every frame)
      if (ref.current) {
        const currentPos = ref.current.position;
        
        // Calculate vector to target
        VECTOR.set(targetPosition[0], targetPosition[1], targetPosition[2])
              .sub(currentPos);
        
        // Strength increases with scroll
        // Map 0.1->0.8 progress to 0->10 strength
        const strength = Math.max(0, (progress - 0.1) * 20); 
        
        // Apply Force
        api.applyForce(
          [VECTOR.x * strength, VECTOR.y * strength, VECTOR.z * strength],
          [0, 0, 0]
        );

        // Also dampen rotation to snap to flat [0,0,0]
        // This is a bit hacky, applying torque to oppose current rotation
        const currentRot = ref.current.rotation;
        api.applyTorque([
            -currentRot.x * strength * 2,
            -currentRot.y * strength * 2,
            -currentRot.z * strength * 2
        ]);
      }
    } else {
        // Chaos Phase: Add gentle random noise if needed, or just let them float
        // Maybe slowly rotate them
        api.applyTorque([Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5]);
    }
  });

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[2.5, 3.5, 0.1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      {/* Photo border */}
      <mesh position={[0, 0, 0.06]}>
         <planeGeometry args={[2.3, 3.3]} />
         <meshBasicMaterial color="#111" />
      </mesh>
    </mesh>
  );
}

function ContactSheetScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const items = [];
    const rows = 4;
    const cols = 5;
    const spacingX = 3;
    const spacingY = 4;
    
    // Center the grid
    const totalWidth = (cols - 1) * spacingX;
    const totalHeight = (rows - 1) * spacingY;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Target Grid Position
        const tx = (c * spacingX) - (totalWidth / 2);
        const ty = ((rows - 1 - r) * spacingY) - (totalHeight / 2); // Flip Y so top row is top
        const tz = 0;

        // Random Start Position (Chaos)
        const sx = (Math.random() - 0.5) * 30;
        const sy = (Math.random() - 0.5) * 30;
        const sz = (Math.random() - 0.5) * 10 + 5; // Start closer to camera?

        items.push({
          startPos: [sx, sy, sz] as [number, number, number],
          startRot: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
          targetPos: [tx, ty, tz] as [number, number, number]
        });
      }
    }
    setPhotos(items);
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <Environment preset="city" />

      <Physics gravity={[0, 0, 0]}> {/* Zero gravity for floating space */}
        <Ground />
        {photos.map((props, i) => (
          <FloatingPhoto 
            key={i} 
            position={props.startPos} 
            rotation={props.startRot} 
            targetPosition={props.targetPos}
            scrollProgress={scrollProgress}
          />
        ))}
      </Physics>
    </>
  );
}

// --- Main Export ---
interface SceneContactSheetProps {
    scrollYProgress?: MotionValue<number>;
}

export function SceneContactSheet({ scrollYProgress }: SceneContactSheetProps) {
  // If not passed (e.g. testing), create a dummy motion value
  // In real usage, page.tsx should pass this.
  
  return (
    <div className="h-[200vh] w-full bg-slate-950 relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas shadows camera={{ position: [0, 0, 18], fov: 45 }}>
             {scrollYProgress && <ContactSheetScene scrollProgress={scrollYProgress} />}
        </Canvas>
        
        {/* Overlay Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center pointer-events-none mix-blend-difference z-10">
          <h2 className="text-4xl md:text-8xl font-serif tracking-tighter opacity-100">
            THE EDIT
          </h2>
          <p className="opacity-0 md:opacity-0 animate-pulse text-sm mt-4">SCROLL TO ORGANIZE</p>
        </div>
      </div>
    </div>
  );
}
