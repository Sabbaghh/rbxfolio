"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, Environment, RoundedBox } from "@react-three/drei"
import * as THREE from "three"

// Section-based messages and poses
const SECTION_DATA = [
  { message: "Work with me!", pose: "idle", link: "https://discord.gg/yourserver" },
  { message: "Check my work!", pose: "pointing", link: "https://discord.gg/yourserver" },
  { message: "Follow me on X!", pose: "wave", link: "https://x.com/yourhandle" },
  { message: "Let's build games!", pose: "excited", link: "https://discord.gg/yourserver" },
  { message: "Hire me today!", pose: "confident", link: "https://discord.gg/yourserver" },
]

// Noob character colors from reference image
const COLORS = {
  head: "#f5c842", // Yellow head
  torso: "#4a7ebf", // Blue shirt
  arms: "#f5c842", // Yellow arms
  legs: "#8a9a5b", // Olive green pants
  eyes: "#1a1a1a", // Black eyes
  mouth: "#1a1a1a", // Black mouth
}

interface CharacterProps {
  scrollY: number
  currentSection: number
  onBubbleClick: () => void
  bubbleMessage: string
  bubbleLink: string
}

function RobloxNoobCharacter({ scrollY, currentSection, onBubbleClick, bubbleMessage }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Get pose based on current section
  const currentPose = SECTION_DATA[currentSection % SECTION_DATA.length].pose

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setTargetRotation({
        x: y * 0.15,
        y: x * 0.3,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Pose configurations
  const poseConfig = useMemo(() => {
    const poses: Record<string, { leftArm: number; rightArm: number; bodyTilt: number }> = {
      idle: { leftArm: Math.PI * 0.1, rightArm: -Math.PI * 0.1, bodyTilt: 0 },
      pointing: { leftArm: Math.PI * 0.1, rightArm: -Math.PI * 0.5, bodyTilt: 0.05 },
      wave: { leftArm: Math.PI * 0.1, rightArm: -Math.PI * 0.7, bodyTilt: -0.05 },
      excited: { leftArm: -Math.PI * 0.4, rightArm: -Math.PI * 0.4, bodyTilt: 0 },
      confident: { leftArm: Math.PI * 0.15, rightArm: Math.PI * 0.15, bodyTilt: 0 },
    }
    return poses[currentPose] || poses.idle
  }, [currentPose])

  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth rotation following mouse
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.y,
        delta * 3
      )

      // Parallax scroll effect
      const scrollOffset = scrollY * 0.001
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        -scrollOffset * 0.5,
        delta * 3
      )

      // Gentle floating motion
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.8) * 0.003

      // Body tilt based on pose
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        poseConfig.bodyTilt,
        delta * 2
      )
    }

    // Animate arms based on pose
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.z,
        poseConfig.leftArm + (currentPose === "wave" ? Math.sin(state.clock.elapsedTime * 5) * 0.2 : 0),
        delta * 4
      )
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.z,
        poseConfig.rightArm + (currentPose === "wave" ? Math.sin(state.clock.elapsedTime * 5) * 0.3 : 0),
        delta * 4
      )
    }
  })

  const characterScale = viewport.width > 6 ? 0.55 : 0.4

  return (
    <Float speed={1} rotationIntensity={0.02} floatIntensity={0.15}>
      <group ref={groupRef} scale={characterScale} position={[0, 0.2, 0]}>
        {/* Speech Bubble - positioned above head */}
        <group position={[0, 2.6, 0.5]}>
          {/* Bubble background */}
          <mesh position={[0, 0, -0.1]}>
            <RoundedBox args={[2.4, 0.8, 0.1]} radius={0.15} smoothness={4}>
              <meshStandardMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.95}
              />
            </RoundedBox>
          </mesh>
          {/* Bubble border glow */}
          <mesh position={[0, 0, -0.15]}>
            <RoundedBox args={[2.5, 0.9, 0.08]} radius={0.18} smoothness={4}>
              <meshStandardMaterial 
                color="#8b5cf6" 
                transparent 
                opacity={0.6}
                emissive="#8b5cf6"
                emissiveIntensity={0.3}
              />
            </RoundedBox>
          </mesh>
          {/* Tail */}
          <mesh position={[0, -0.5, -0.1]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.15, 0.3, 3]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Clickable HTML overlay for bubble */}
        <group position={[0, 2.6, 0.6]}>
          <mesh 
            onClick={onBubbleClick}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
            <planeGeometry args={[2.4, 0.8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>

        {/* Text on bubble using HTML */}
        <group position={[0, 2.6, 0.55]}>
          <mesh>
            <planeGeometry args={[0.01, 0.01]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {/* Render text as 3D */}
          <group scale={isHovered ? 1.05 : 1}>
            {bubbleMessage.split('').map((char, i) => (
              <mesh key={i} position={[(i - bubbleMessage.length / 2 + 0.5) * 0.14, 0, 0]}>
                <boxGeometry args={[0.12, 0.18, 0.02]} />
                <meshStandardMaterial 
                  color={isHovered ? "#8b5cf6" : "#1a1a2e"} 
                  transparent
                  opacity={char === ' ' ? 0 : 1}
                />
              </mesh>
            ))}
          </group>
        </group>

        {/* HEAD - Rounded box like reference */}
        <RoundedBox args={[1.1, 1.1, 1.1]} radius={0.15} smoothness={4} position={[0, 1.55, 0]}>
          <meshStandardMaterial color={COLORS.head} />
        </RoundedBox>

        {/* Eyes - Simple dots like reference */}
        <mesh position={[-0.2, 1.65, 0.56]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>
        <mesh position={[0.2, 1.65, 0.56]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>

        {/* Serious eyebrows */}
        <mesh position={[-0.2, 1.8, 0.56]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.18, 0.04, 0.02]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>
        <mesh position={[0.2, 1.8, 0.56]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.18, 0.04, 0.02]} />
          <meshStandardMaterial color={COLORS.eyes} />
        </mesh>

        {/* Mouth - straight line for serious look */}
        <mesh position={[0, 1.4, 0.56]}>
          <boxGeometry args={[0.25, 0.05, 0.02]} />
          <meshStandardMaterial color={COLORS.mouth} />
        </mesh>

        {/* TORSO - Blue shirt */}
        <RoundedBox args={[1.3, 1.2, 0.65]} radius={0.08} smoothness={4} position={[0, 0.4, 0]}>
          <meshStandardMaterial color={COLORS.torso} />
        </RoundedBox>

        {/* LEFT ARM - Yellow, no joints */}
        <mesh 
          ref={leftArmRef}
          position={[-0.85, 0.5, 0]}
        >
          <RoundedBox args={[0.4, 1.1, 0.45]} radius={0.08} smoothness={4}>
            <meshStandardMaterial color={COLORS.arms} />
          </RoundedBox>
        </mesh>

        {/* RIGHT ARM - Yellow, no joints */}
        <mesh 
          ref={rightArmRef}
          position={[0.85, 0.5, 0]}
        >
          <RoundedBox args={[0.4, 1.1, 0.45]} radius={0.08} smoothness={4}>
            <meshStandardMaterial color={COLORS.arms} />
          </RoundedBox>
        </mesh>

        {/* LEFT LEG - Olive green */}
        <RoundedBox args={[0.5, 1.1, 0.5]} radius={0.06} smoothness={4} position={[-0.32, -0.75, 0]}>
          <meshStandardMaterial color={COLORS.legs} />
        </RoundedBox>

        {/* RIGHT LEG - Olive green */}
        <RoundedBox args={[0.5, 1.1, 0.5]} radius={0.06} smoothness={4} position={[0.32, -0.75, 0]}>
          <meshStandardMaterial color={COLORS.legs} />
        </RoundedBox>
      </group>
    </Float>
  )
}

function FloatingParticles({ scrollY }: { scrollY: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
      groupRef.current.position.y = -scrollY * 0.0005
    }
  })

  return (
    <group ref={groupRef}>
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={1.5 + i * 0.2} rotationIntensity={0.3} floatIntensity={0.8}>
          <mesh position={[
            Math.sin(i * 1.2) * 3,
            Math.cos(i * 0.8) * 1.5,
            Math.sin(i * 0.5) * 2 - 1
          ]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial
              color={["#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4", "#f472b6", "#a855f7"][i]}
              emissive={["#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4", "#f472b6", "#a855f7"][i]}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export function RobloxCharacter3D() {
  const [scrollY, setScrollY] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Calculate current section based on scroll position
      const sectionHeight = window.innerHeight * 0.8
      const newSection = Math.floor(window.scrollY / sectionHeight)
      setCurrentSection(newSection)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const sectionData = SECTION_DATA[currentSection % SECTION_DATA.length]

  const handleBubbleClick = () => {
    window.open(sectionData.link, "_blank")
  }

  return (
    <div className="fixed right-0 top-0 w-[280px] md:w-[350px] lg:w-[420px] h-screen pointer-events-none z-30">
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 45 }}
        style={{ background: "transparent", pointerEvents: "auto" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 3]} intensity={0.4} color="#8b5cf6" />
        <pointLight position={[3, -2, 2]} intensity={0.3} color="#ec4899" />
        
        <RobloxNoobCharacter 
          scrollY={scrollY} 
          currentSection={currentSection}
          onBubbleClick={handleBubbleClick}
          bubbleMessage={sectionData.message}
          bubbleLink={sectionData.link}
        />
        <FloatingParticles scrollY={scrollY} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
