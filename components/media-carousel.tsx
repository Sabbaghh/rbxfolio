"use client"

import { useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MediaItem {
  id: string
  type: string
  thumbnail: string
  title: string
  description: string
  date: string
}

interface MediaCarouselProps {
  items: MediaItem[]
}

export function MediaCarousel({ items }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative group">
      {/* Scroll buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hover:bg-background"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hover:bg-background"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-72 snap-start group/card"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
              <Image
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover/card:scale-110"
              />
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary-foreground ml-1" />
                </div>
              </div>
              
              {/* Video badge */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
                Video
              </div>
            </div>
            
            <div className="mt-3">
              <h4 className="font-semibold text-foreground line-clamp-1 group-hover/card:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
        
        {/* View more card */}
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-72 snap-start"
        >
          <div className="aspect-video rounded-xl overflow-hidden bg-secondary/50 border border-border transition-all hover:border-primary/50 hover:bg-secondary flex items-center justify-center">
            <div className="text-center">
              <ExternalLink className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <span className="text-sm font-medium text-foreground">View more on X</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
