"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"

interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
  direction?: "up" | "down"
}

export function ParallaxSection({ 
  children, 
  speed = 0.5, 
  className = "",
  direction = "up"
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const elementTop = rect.top
        const elementVisible = elementTop < windowHeight && elementTop > -rect.height

        if (elementVisible) {
          const scrollProgress = (windowHeight - elementTop) / (windowHeight + rect.height)
          const parallaxOffset = (scrollProgress - 0.5) * 100 * speed
          setOffset(direction === "up" ? -parallaxOffset : parallaxOffset)
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed, direction])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div 
        style={{ 
          transform: `translateY(${offset}px)`,
          transition: "transform 0.1s ease-out"
        }}
      >
        {children}
      </div>
    </div>
  )
}

interface ParallaxBackgroundProps {
  children: ReactNode
  className?: string
}

export function ParallaxBackground({ children, className = "" }: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Parallax gradient layers */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-pink/20"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)]"
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.15),transparent_50%)]"
        style={{ transform: `translateY(${-scrollY * 0.08}px)` }}
      />
      
      {/* Floating grid effect */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          transform: `translateY(${scrollY * 0.15}px)`
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
