"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ContactButton() {
  return (
    <a
      href="https://discord.gg/your-server"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button 
        size="lg" 
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white gap-2 font-semibold shadow-lg shadow-[#5865F2]/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#5865F2]/40"
      >
        <MessageCircle className="h-5 w-5" />
        Work With Me
      </Button>
    </a>
  )
}
