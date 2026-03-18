"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useTexture, ContactShadows, Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import { MotionValue, useTransform } from "framer-motion";

// --- Components ---

function PholioBook({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const coverRef = useRef<THREE.Group>(null);
  
  // Book Dimensions
  const width = 3;
  const height = 4;
  const thickness = 0.5;

  useFrame((state) => {
    const progress = scrollProgress.get();
    
    // Animation Sequence based on scroll (0 to 1)
    if (group.current) {
      // 1. Float/Rotate in
      const p1 = Math.min(1, progress * 4); // 0 -> 0.25 range mapped to 0-1
      group.current.position.y = THREE.MathUtils.lerp(-5, 0, p1);
      group.current.rotation.y = THREE.MathUtils.lerp(Math.PI, 0, p1);
      
      // 2. Show Spine (0.25 -> 0.5)
      // We want to rotate to show the spine (left side)
      if (progress > 0.25) {
         const p2 = Math.min(1, (progress - 0.25) * 4);
         group.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 2, p2);
      }

      // 3. Open Book (0.5 -> 1.0)
      if (progress > 0.5 && coverRef.current) {
          const p3 = Math.min(1, (progress - 0.5) * 2);
          // Rotate front cover open
          coverRef.current.rotation.y = THREE.MathUtils.lerp(0, -Math.PI * 0.6, p3);
          
          // Tilt whole book for reading
          group.current.rotation.x = THREE.MathUtils.lerp(0, 0.5, p3);
      }
    }
  });

  return (
    <group ref={group}>
      {/* Spine (Static relative to back) */}
      <mesh position={[-width/2, 0, 0]}>
        <boxGeometry args={[0.2, height, thickness]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
      </mesh>
      
      {/* Spine Text (Vertical) */}
      <Text 
        position={[-width/2 - 0.11, 0, 0]} 
        rotation={[0, -Math.PI / 2, -Math.PI / 2]} 
        fontSize={0.3} 
        color="#C9A55A" // Gold
        anchorX="center"
        anchorY="middle"
      >
        PHOLIO.STUDIO
      </Text>

      {/* Back Cover */}
      <mesh position={[0, 0, -thickness/2]}>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
      </mesh>

      {/* Pages Block */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width - 0.1, height - 0.2, thickness - 0.1]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.9} />
      </mesh>

      {/* Front Cover (Pivots from spine) */}
      <group position={[-width/2, 0, thickness/2]} ref={coverRef}>
         <mesh position={[width/2, 0, 0]}>
            <boxGeometry args={[width, height, 0.05]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
         </mesh>
         
         {/* Cover Gold Foil Title */}
         <Text 
            position={[width/2, 0, 0.03]} 
            fontSize={0.5} 
            color="#C9A55A"
            // font="/fonts/Inter-Bold.ttf" // Removed to fix 404
            anchorX="center"
            anchorY="middle"
         >
            PHOLIO
         </Text>
      </group>
      
    </group>
  );
}

// --- Main Export ---
interface SceneBookProps {
    scrollYProgress?: MotionValue<number>;
}

export function SceneBook({ scrollYProgress }: SceneBookProps) {
  // Use a local dummy motion value if not provided
  const dummyProgress = useTransform(new MotionValue(0), [0, 1], [0, 1]);
  const activeProgress = scrollYProgress || dummyProgress;

  return (
    <div className="h-[200vh] w-full bg-cream relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 35 }}>
            <ambientLight intensity={0.8} />
            <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={2} castShadow />
            <Environment preset="studio" />
            
            <PholioBook scrollProgress={activeProgress} />
            
            {/* <ContactShadows position={[0, -3, 0]} opacity={0.4} blur={2} /> */}
        </Canvas>
      </div>

      {/* Copy Overlay - Scrolls with normal flow */}
      <div className="absolute top-[20%] left-10 md:left-20 max-w-sm pointer-events-none mix-blend-multiply z-10">
         <h3 className="text-6xl font-serif text-ink mb-4">OWN YOUR NAME</h3>
         <p className="text-lg text-ink-muted">Custom domains. SEO optimized. Yours.</p>
      </div>

      <div className="absolute bottom-[20%] right-10 md:right-20 max-w-sm pointer-events-none mix-blend-multiply text-right z-10">
         <h3 className="text-6xl font-serif text-ink mb-4">KNOW YOUR WORTH</h3>
         <p className="text-lg text-ink-muted">Real-time agency analytics. See who's watching.</p>
      </div>
    </div>
  );
}
