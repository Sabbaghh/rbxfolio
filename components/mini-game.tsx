"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 200
const GROUND_Y = 160
const GRAVITY = 0.8
const JUMP_FORCE = -14
const GAME_SPEED_INITIAL = 6
const GAME_SPEED_INCREMENT = 0.001

interface Obstacle {
  x: number
  width: number
  height: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

export function MiniGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  
  const gameStateRef = useRef({
    playerY: GROUND_Y - 40,
    playerVY: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    gameSpeed: GAME_SPEED_INITIAL,
    frameCount: 0,
    score: 0,
    groundOffset: 0,
  })

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      playerY: GROUND_Y - 40,
      playerVY: 0,
      isJumping: false,
      obstacles: [],
      particles: [],
      gameSpeed: GAME_SPEED_INITIAL,
      frameCount: 0,
      score: 0,
      groundOffset: 0,
    }
    setScore(0)
    setGameOver(false)
  }, [])

  const jump = useCallback(() => {
    const state = gameStateRef.current
    if (!state.isJumping && state.playerY >= GROUND_Y - 40) {
      state.playerVY = JUMP_FORCE
      state.isJumping = true
      // Add jump particles
      for (let i = 0; i < 5; i++) {
        state.particles.push({
          x: 60,
          y: state.playerY + 40,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * -3,
          life: 20,
          color: `hsl(${280 + Math.random() * 50}, 80%, 60%)`,
        })
      }
    }
  }, [])

  const startGame = useCallback(() => {
    resetGame()
    setIsPlaying(true)
    setIsAutoPlay(false)
  }, [resetGame])

  // Handle input
  useEffect(() => {
    if (!isPlaying || isAutoPlay) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        if (gameOver) {
          startGame()
        } else {
          jump()
        }
      }
    }

    const handleClick = () => {
      if (gameOver) {
        startGame()
      } else {
        jump()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    canvasRef.current?.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      canvasRef.current?.removeEventListener("click", handleClick)
    }
  }, [isPlaying, isAutoPlay, gameOver, jump, startGame])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const drawPixelCharacter = (x: number, y: number) => {
      // Noob-style character matching 3D model
      
      // Head - Yellow rounded
      ctx.fillStyle = "#f5c842"
      ctx.beginPath()
      ctx.roundRect(x + 3, y - 18, 24, 22, 4)
      ctx.fill()
      
      // Eyes - Simple dots
      ctx.fillStyle = "#1a1a1a"
      ctx.beginPath()
      ctx.arc(x + 10, y - 8, 3, 0, Math.PI * 2)
      ctx.arc(x + 20, y - 8, 3, 0, Math.PI * 2)
      ctx.fill()
      
      // Serious eyebrows
      ctx.fillStyle = "#1a1a1a"
      ctx.save()
      ctx.translate(x + 10, y - 14)
      ctx.rotate(0.2)
      ctx.fillRect(-4, 0, 8, 2)
      ctx.restore()
      ctx.save()
      ctx.translate(x + 20, y - 14)
      ctx.rotate(-0.2)
      ctx.fillRect(-4, 0, 8, 2)
      ctx.restore()
      
      // Mouth - straight line
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(x + 10, y - 2, 10, 2)
      
      // Body/Torso - Blue shirt
      ctx.fillStyle = "#4a7ebf"
      ctx.beginPath()
      ctx.roundRect(x, y + 4, 30, 26, 3)
      ctx.fill()
      
      // Arms - Yellow
      ctx.fillStyle = "#f5c842"
      ctx.beginPath()
      ctx.roundRect(x - 6, y + 6, 8, 22, 2)
      ctx.roundRect(x + 28, y + 6, 8, 22, 2)
      ctx.fill()
      
      // Legs - Olive green
      ctx.fillStyle = "#8a9a5b"
      ctx.beginPath()
      ctx.roundRect(x + 2, y + 30, 11, 14, 2)
      ctx.roundRect(x + 17, y + 30, 11, 14, 2)
      ctx.fill()
    }

    const drawObstacle = (obstacle: Obstacle) => {
      // Draw Roblox-style block
      ctx.fillStyle = "#ef4444"
      ctx.fillRect(obstacle.x, GROUND_Y - obstacle.height, obstacle.width, obstacle.height)
      
      // Studs on top
      ctx.fillStyle = "#fca5a5"
      const studSize = 6
      const studSpacing = obstacle.width / 2
      for (let i = 0; i < 2; i++) {
        ctx.beginPath()
        ctx.arc(
          obstacle.x + studSpacing / 2 + i * studSpacing,
          GROUND_Y - obstacle.height - 3,
          studSize / 2,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
    }

    const gameLoop = () => {
      const state = gameStateRef.current
      
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      gradient.addColorStop(0, "#1e1b4b")
      gradient.addColorStop(1, "#0f172a")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw parallax stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      for (let i = 0; i < 30; i++) {
        const x = ((i * 47 + state.groundOffset * 0.2) % CANVAS_WIDTH)
        const y = (i * 23) % (GROUND_Y - 20)
        ctx.fillRect(x, y, 2, 2)
      }

      // Draw ground
      state.groundOffset = (state.groundOffset + state.gameSpeed) % 40
      ctx.fillStyle = "#374151"
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 40)
      
      // Ground pattern
      ctx.fillStyle = "#4b5563"
      for (let x = -state.groundOffset; x < CANVAS_WIDTH; x += 40) {
        ctx.fillRect(x, GROUND_Y, 20, 4)
      }

      // Update and draw particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.2
        p.life--
        
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life / 20
        ctx.fillRect(p.x, p.y, 4, 4)
        ctx.globalAlpha = 1
        
        return p.life > 0
      })

      // Auto-play logic
      if (isAutoPlay) {
        state.frameCount++
        if (state.frameCount % 80 === 0) {
          // Spawn obstacles less frequently in auto mode
          state.obstacles.push({
            x: CANVAS_WIDTH,
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 30,
          })
        }

        // Auto jump when obstacle is near
        const nearestObstacle = state.obstacles.find(o => o.x > 40 && o.x < 150)
        if (nearestObstacle && !state.isJumping && state.playerY >= GROUND_Y - 40) {
          state.playerVY = JUMP_FORCE
          state.isJumping = true
          for (let i = 0; i < 3; i++) {
            state.particles.push({
              x: 60,
              y: state.playerY + 40,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * -2,
              life: 15,
              color: `hsl(${280 + Math.random() * 50}, 70%, 50%)`,
            })
          }
        }
      } else if (isPlaying && !gameOver) {
        // Normal gameplay
        state.frameCount++
        state.gameSpeed += GAME_SPEED_INCREMENT
        
        // Spawn obstacles
        if (state.frameCount % Math.max(60, 100 - Math.floor(state.score / 10)) === 0) {
          state.obstacles.push({
            x: CANVAS_WIDTH,
            width: 25 + Math.random() * 25,
            height: 35 + Math.random() * 35,
          })
        }

        // Update score
        if (state.frameCount % 5 === 0) {
          state.score++
          setScore(state.score)
        }
      }

      // Update player physics
      state.playerVY += GRAVITY
      state.playerY += state.playerVY

      if (state.playerY >= GROUND_Y - 40) {
        state.playerY = GROUND_Y - 40
        state.playerVY = 0
        state.isJumping = false
      }

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter(obstacle => {
        obstacle.x -= state.gameSpeed
        drawObstacle(obstacle)

        // Collision detection (only in playing mode, not auto)
        if (!isAutoPlay && isPlaying && !gameOver) {
          const playerBox = { x: 50, y: state.playerY, width: 30, height: 40 }
          const obstacleBox = { 
            x: obstacle.x, 
            y: GROUND_Y - obstacle.height, 
            width: obstacle.width, 
            height: obstacle.height 
          }

          if (
            playerBox.x < obstacleBox.x + obstacleBox.width &&
            playerBox.x + playerBox.width > obstacleBox.x &&
            playerBox.y < obstacleBox.y + obstacleBox.height &&
            playerBox.y + playerBox.height > obstacleBox.y
          ) {
            // Game over
            setGameOver(true)
            setHighScore(prev => Math.max(prev, state.score))
            
            // Explosion particles
            for (let i = 0; i < 20; i++) {
              state.particles.push({
                x: 60,
                y: state.playerY + 20,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                color: `hsl(${Math.random() * 60 + 280}, 80%, 60%)`,
              })
            }
          }
        }

        return obstacle.x > -50
      })

      // Draw player
      drawPixelCharacter(50, state.playerY)

      // Draw UI
      if (!isAutoPlay && isPlaying) {
        ctx.fillStyle = "#fff"
        ctx.font = "bold 16px monospace"
        ctx.fillText(`Score: ${state.score}`, 20, 30)
        if (highScore > 0) {
          ctx.fillStyle = "#a855f7"
          ctx.fillText(`Best: ${highScore}`, 20, 50)
        }
      }

      // Game over screen
      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        
        ctx.fillStyle = "#fff"
        ctx.font = "bold 32px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)
        
        ctx.font = "16px sans-serif"
        ctx.fillStyle = "#a855f7"
        ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15)
        ctx.fillText("Click or press Space to restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45)
        ctx.textAlign = "left"
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPlaying, isAutoPlay, gameOver, highScore])

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-card">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto"
        style={{ imageRendering: "pixelated" }}
      />
      
      {/* Play button overlay */}
      {isAutoPlay && (
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            onClick={startGame}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Play className="h-4 w-4" />
            Play Game
          </Button>
        </div>
      )}

      {/* Reset button when playing */}
      {!isAutoPlay && !gameOver && (
        <div className="absolute top-3 right-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              resetGame()
              setIsAutoPlay(true)
              setIsPlaying(false)
            }}
            className="bg-background/50 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!isAutoPlay && !gameOver && isPlaying && (
        <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/50 backdrop-blur-sm px-2 py-1 rounded">
          Press Space or Click to jump
        </div>
      )}
    </div>
  )
}
