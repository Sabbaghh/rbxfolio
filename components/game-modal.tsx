"use client"

import { useEffect } from "react"
import Image from "next/image"
import { X, Wrench, Zap, AlertTriangle, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Game {
  id: string
  title: string
  studio: string
  role: string
  thumbnail: string
  banner: string
  description: string
  responsibilities: string[]
  systems: string[]
  challenges: string[]
  tools: string[]
}

interface GameModalProps {
  game: Game | null
  isOpen: boolean
  onClose: () => void
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  if (!isOpen || !game) return null

  const roleColors: Record<string, string> = {
    "Lead Scripter": "bg-neon-purple",
    "Gameplay Engineer": "bg-neon-blue",
    "Systems Architect": "bg-neon-cyan",
    "Core Developer": "bg-neon-pink",
    "Lead Developer": "bg-neon-purple",
    "Gameplay Programmer": "bg-neon-blue",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl shadow-primary/10 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Banner */}
          <div className="relative h-48 md:h-64 w-full">
            <Image
              src={game.banner || "/placeholder.svg"}
              alt={game.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground mb-3",
                roleColors[game.role] || "bg-primary"
              )}>
                {game.role}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {game.title}
              </h2>
              <p className="text-muted-foreground mt-1">{game.studio}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Description */}
            <div>
              <p className="text-foreground/90 leading-relaxed text-lg">
                {game.description}
              </p>
            </div>

            {/* Responsibilities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Responsibilities</h3>
              </div>
              <ul className="space-y-2">
                {game.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/80">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Systems */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-bold text-foreground">Key Systems Built</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {game.systems.map((system, i) => (
                  <div 
                    key={i}
                    className="px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground/90"
                  >
                    {system}
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Challenges */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-chart-5" />
                <h3 className="text-xl font-bold text-foreground">Technical Challenges</h3>
              </div>
              <ul className="space-y-2">
                {game.challenges.map((challenge, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/80">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-chart-5 shrink-0" />
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools & Patterns */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-5 w-5 text-neon-cyan" />
                <h3 className="text-xl font-bold text-foreground">Tools & Patterns</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {game.tools.map((tool, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 text-sm text-foreground/90"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
