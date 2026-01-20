"use client"

import React from "react"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

interface GameCardProps {
  id: string
  title: string
  studio: string
  role: string
  thumbnail: string
  onClick: () => void
}

export function GameCard({ title, studio, role, thumbnail, onClick }: GameCardProps) {
  const roleColors: Record<string, string> = {
    "Lead Scripter": "bg-neon-purple/90",
    "Gameplay Engineer": "bg-neon-blue/90",
    "Systems Architect": "bg-neon-cyan/90",
    "Core Developer": "bg-neon-pink/90",
    "Lead Developer": "bg-neon-purple/90",
    "Gameplay Programmer": "bg-neon-blue/90",
  }

  const handleDiscordClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open("https://discord.gg/yourserver", "_blank")
  }

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-left"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
        
        {/* Role Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground backdrop-blur-sm",
            roleColors[role] || "bg-primary/90"
          )}>
            {role}
          </span>
        </div>

        {/* Play Button Overlay - Discord CTA */}
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          onClick={handleDiscordClick}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-lg shadow-neon-purple/50 transform group-hover:scale-110 transition-transform duration-300">
              <Play className="h-6 w-6 text-white ml-1" fill="white" />
            </div>
            <span className="text-xs font-semibold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Contact on Discord
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {studio}
        </p>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      </div>
    </button>
  )
}
