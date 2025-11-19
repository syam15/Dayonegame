import Phaser from "phaser"
import { screenSize, gameConfig } from "./gameConfig.json"

export class GameUI {
  private scene: Phaser.Scene
  private scoreText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private goalText!: Phaser.GameObjects.Image
  private controlsText!: Phaser.GameObjects.Text
  private pauseText!: Phaser.GameObjects.Text
  
  private player1Score = 0
  private player2Score = 0
  private gameTime = gameConfig.gameTime.value
  private isGamePaused = false
  
  private gameTimer!: Phaser.Time.TimerEvent

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createUI()
    this.startGameTimer()
  }

  private createUI(): void {
    // Create score display
    this.createScoreDisplay()
    
    // Create timer display
    this.createTimerDisplay()
    
    // Create goal celebration text (hidden initially)
    this.createGoalText()
    
    // Create controls display
    this.createControlsDisplay()
    
    // Create pause text (hidden initially)
    this.createPauseText()
  }

  private createScoreDisplay(): void {
    const centerX = screenSize.width.value / 2
    
    this.scoreText = this.scene.add.text(centerX, 60, "0 - 0", {
      fontSize: "48px",
      fontFamily: "Arial Black",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    // Add background panel
    const scoreBg = this.scene.add.graphics()
    scoreBg.fillStyle(0x000066, 0.8)
    scoreBg.fillRoundedRect(centerX - 100, 30, 200, 60, 20)
    scoreBg.setDepth(-1)
    this.scoreText.setDepth(0)
  }

  private createTimerDisplay(): void {
    const centerX = screenSize.width.value / 2
    
    this.timerText = this.scene.add.text(centerX, 120, this.formatTime(this.gameTime), {
      fontSize: "36px",
      fontFamily: "Arial Black",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    // Add background panel
    const timerBg = this.scene.add.graphics()
    timerBg.fillStyle(0x006600, 0.8)
    timerBg.fillRoundedRect(centerX - 80, 95, 160, 50, 15)
    timerBg.setDepth(-1)
    this.timerText.setDepth(0)
  }

  private createGoalText(): void {
    const centerX = screenSize.width.value / 2
    const centerY = screenSize.height.value / 2
    
    this.goalText = this.scene.add.image(centerX, centerY, "goal_text")
    this.goalText.setScale(0.8)
    this.goalText.setVisible(false)
    this.goalText.setDepth(1000) // High depth to show above everything
  }

  private createControlsDisplay(): void {
    const leftX = 100
    const rightX = screenSize.width.value - 100
    const topY = 200 // Move controls to top of screen
    
    // Player 1 controls (Left side)
    const p1ControlsBg = this.scene.add.graphics()
    p1ControlsBg.fillStyle(0x004488, 0.7)
    p1ControlsBg.fillRoundedRect(20, topY - 40, 160, 100, 10)
    
    this.scene.add.text(leftX, topY - 40, "Player 1", {
      fontSize: "16px",
      fontFamily: "Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(leftX, topY - 15, "W - Jump", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(leftX, topY, "A/D - Move", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(leftX, topY + 15, "S - Slide", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(leftX, topY + 30, "SPACE - Kick", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    // Player 2 controls (Right side)
    const p2ControlsBg = this.scene.add.graphics()
    p2ControlsBg.fillStyle(0x884400, 0.7)
    p2ControlsBg.fillRoundedRect(rightX - 80, topY - 40, 160, 100, 10)
    
    this.scene.add.text(rightX, topY - 40, "Player 2", {
      fontSize: "16px",
      fontFamily: "Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(rightX, topY - 15, "↑ - Jump", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(rightX, topY, "←/→ - Move", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(rightX, topY + 15, "↓ - Slide", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.scene.add.text(rightX, topY + 30, "SHIFT - Kick", {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5, 0.5)
  }

  private createPauseText(): void {
    const centerX = screenSize.width.value / 2
    const centerY = screenSize.height.value / 2
    
    this.pauseText = this.scene.add.text(centerX, centerY - 50, "GAME PAUSED\nPress P to Continue", {
      fontSize: "32px",
      fontFamily: "Arial Black",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      align: "center"
    }).setOrigin(0.5, 0.5)
    
    this.pauseText.setVisible(false)
    this.pauseText.setDepth(1000)
    
    // Add pause background
    const pauseBg = this.scene.add.graphics()
    pauseBg.fillStyle(0x000000, 0.7)
    pauseBg.fillRect(0, 0, screenSize.width.value, screenSize.height.value)
    pauseBg.setVisible(false)
    pauseBg.setDepth(999)
  }

  private startGameTimer(): void {
    console.log(`🕐 Starting game timer with ${this.gameTime} seconds`)
    this.gameTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      repeat: this.gameTime // Will repeat gameTime times, with updateTimer decrementing
    })
  }

  private updateTimer(): void {
    this.gameTime--
    console.log(`⏰ Timer update: ${this.gameTime} seconds remaining`)
    this.timerText.setText(this.formatTime(this.gameTime))
    
    // Change timer color when time is running out
    if (this.gameTime <= 10) {
      this.timerText.setColor("#ff0000")
      
      // Flash timer when very low
      if (this.gameTime <= 5) {
        this.scene.tweens.add({
          targets: this.timerText,
          alpha: 0.3,
          duration: 250,
          yoyo: true,
          repeat: 1
        })
      }
    } else if (this.gameTime <= 30) {
      this.timerText.setColor("#ff8800")
    }
    
    // End game when time reaches 0
    if (this.gameTime <= 0) {
      console.log("🏁 Game time ended! Triggering game end...")
      this.gameTimer.destroy() // Stop the timer
      this.onGameEnd()
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  public updateScore(player1Score: number, player2Score: number): void {
    this.player1Score = player1Score
    this.player2Score = player2Score
    this.scoreText.setText(`${player1Score} - ${player2Score}`)
  }

  public showGoal(scoringPlayer: 1 | 2): void {
    this.goalText.setVisible(true)
    
    // **SMALLER GOAL CELEBRATION ANIMATION**
    this.goalText.setScale(0.3) // Start bigger to avoid huge scaling
    this.scene.tweens.add({
      targets: this.goalText,
      scaleX: 0.8, // Much smaller final size
      scaleY: 0.8, // Much smaller final size
      duration: 300, // Faster animation
      ease: 'Back.easeOut'
    })
    
    // **REDUCED SCREEN SHAKE**
    this.scene.cameras.main.shake(200, 0.005) // Much smaller shake
    
    // Hide after celebration time
    this.scene.time.delayedCall(gameConfig.goalCelebrationTime.value * 1000, () => {
      this.goalText.setVisible(false)
      this.goalText.setScale(1) // Reset scale for next time
    })
  }

  public pauseGame(): void {
    this.isGamePaused = true
    this.pauseText.setVisible(true)
    this.gameTimer.paused = true
  }

  public resumeGame(): void {
    this.isGamePaused = false
    this.pauseText.setVisible(false)
    this.gameTimer.paused = false
  }

  public isPaused(): boolean {
    return this.isGamePaused
  }

  public getRemainingTime(): number {
    return this.gameTime
  }

  public getScore(): { player1: number, player2: number } {
    return { player1: this.player1Score, player2: this.player2Score }
  }

  private onGameEnd(): void {
    console.log("🏆 GameUI: Game ended!")
    console.log(`📊 Final Score: Player 1: ${this.player1Score}, Player 2: ${this.player2Score}`)
    
    const winner = this.player1Score > this.player2Score ? 1 : (this.player2Score > this.player1Score ? 2 : 0)
    console.log(`🏆 Winner: ${winner === 0 ? 'Draw' : `Player ${winner}`}`)
    
    // Emit game end event or call scene method
    this.scene.events.emit('gameEnd', {
      player1Score: this.player1Score,
      player2Score: this.player2Score,
      winner: winner
    })
  }

  public destroy(): void {
    if (this.gameTimer) {
      this.gameTimer.destroy()
    }
  }
}
