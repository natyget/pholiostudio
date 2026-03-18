"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Text, RoundedBox, Float } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

// --- Components ---

function Card({ 
  position, 
  rotation, 
  materialType, 
  title, 
  price 
}: { 
  position: [number, number, number], 
  rotation: [number, number, number],
  materialType: "paper" | "metal",
  title: string,
  price: string
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (ref.current) {
        // Gentle float rotation
        // ref.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        
        // Mouse interaction tilt
        const mouseX = state.mouse.x;
        const mouseY = state.mouse.y;
        
        // Lerp towards mouse tilt
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, rotation[0] + mouseY * 0.2, 0.1);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, rotation[1] + mouseX * 0.2, 0.1);
        
        // Hover scale
        const scale = hovered ? 1.05 : 1;
        ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group 
        ref={ref} 
        position={position} 
        rotation={rotation}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
    >
      <RoundedBox args={[2.2, 3.4, 0.05]} radius={0.1} smoothness={4} castShadow receiveShadow>
        {materialType === "paper" ? (
             <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
        ) : (
             <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
        )}
      </RoundedBox>

      {/* Text Layer */}
      <group position={[0, 0, 0.03]}>
         <Text 
            position={[0, 1, 0]} 
            fontSize={0.2} 
            color={materialType === "paper" ? "#333" : "#C9A55A"}
            // font="/fonts/Inter-Bold.ttf"
            anchorX="center"
         >
            {title}
         </Text>

         <Text 
            position={[0, 0, 0]} 
            fontSize={0.5} 
            color={materialType === "paper" ? "#111" : "#fff"}
            // font="/fonts/NotoSerif-Regular.ttf"
            anchorX="center"
         >
            {price}
         </Text>

         <Text 
            position={[0, -1, 0]} 
            fontSize={0.1} 
            color={materialType === "paper" ? "#666" : "#888"}
            maxWidth={1.8}
            textAlign="center"
            anchorX="center"
         >
            {materialType === "paper" 
               ? "Basic Comp Card\nLimited Search\nCommunity Support"
               : "Custom Domain\nGlobal Discovery\nPriority Analytics\nAgency Push"
            }
         </Text>
      </group>
    </group>
  );
}

// --- Main Export ---
export function SceneAccessCards() {
  return (
    <div className="h-screen w-full bg-cream relative">
      
      <div className="absolute inset-0 flex items-center justify-center">
        <Canvas shadows camera={{ position: [0, 0, 6], fov: 40 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 5, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Standard Card */}
                <Card 
                    position={[-1.5, 0, 0]} 
                    rotation={[0, 0.2, 0]} 
                    materialType="paper"
                    title="STANDARD"
                    price="Free"
                />

                {/* Studio+ Box (Centerpiece) */}
                <Card 
                    position={[1.5, 0, 0]} 
                    rotation={[0, -0.2, 0]} 
                    materialType="metal"
                    title="STUDIO+"
                    price="$9.99/mo"
                />
            </Float>
        </Canvas>
      </div>

       {/* Header */}
       <div className="absolute top-20 w-full text-center pointer-events-none">
          <h2 className="text-4xl md:text-6xl font-serif text-ink">CHOOSE ACCESS</h2>
       </div>

    </div>
  );
}
