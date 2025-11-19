import Phaser from "phaser"
import { screenSize, audioConfig } from "../gameConfig.json"

interface VictoryData {
  winner: number // 1 or 2
  player1Score: number
  player2Score: number
  gameMode: "1v1" | "1vAI"
}

export default class VictoryScene extends Phaser.Scene {
  private victoryMusic!: Phaser.Sound.BaseSound
  private buttonClickSound!: Phaser.Sound.BaseSound
  private restartButton!: Phaser.GameObjects.Image
  private backButton!: Phaser.GameObjects.Image
  private victoryBanner!: Phaser.GameObjects.Image
  private background!: Phaser.GameObjects.Image
  private victoryData!: VictoryData
  
  constructor() {
    super({ key: "VictoryScene" })
  }

  init(data: VictoryData): void {
    console.log("🏆 VictoryScene: init() called with data:", data)
    this.victoryData = data
    
    // Log victory details
    if (data.winner === 0) {
      console.log("🤝 Game result: DRAW")
    } else {
      console.log(`🎉 Game result: Player ${data.winner} WINS!`)
    }
    console.log(`📊 Final Score: ${data.player1Score} - ${data.player2Score}`)
  }

  preload(): void {
    // All assets are now loaded in LoadingScene via asset-pack.json
  }

  create(): void {
    // Create background
    this.createBackground()
    
    // Create victory display
    this.createVictoryDisplay()
    this.createPlayerPoses()
    this.createScoreDisplay()
    this.createButtons()
    this.createCelebrationEffects()
    
    // Setup audio
    this.setupAudio()
    
    // Setup input
    this.setupInput()
    
    console.log("🏆 VICTORY SCENE: Created successfully")
  }

  private createBackground(): void {
    const centerX = screenSize.width.value / 2
    const centerY = screenSize.height.value / 2
    
    // Create soccer field background
    this.background = this.add.image(centerX, centerY, "clean_soccer_field_background")
    
    // Scale background to fill screen
    const scaleX = screenSize.width.value / this.background.width
    const scaleY = screenSize.height.value / this.background.height
    const scale = Math.max(scaleX, scaleY)
    
    this.background.setScale(scale)
    this.background.setDepth(-10)
    
    // Add victory overlay
    const overlay = this.add.rectangle(centerX, centerY, screenSize.width.value, screenSize.height.value, 0x000000, 0.6)
    overlay.setDepth(-5)
    
    // Add golden celebration overlay
    const goldOverlay = this.add.rectangle(centerX, centerY, screenSize.width.value, screenSize.height.value, 0xFFD700, 0.1)
    goldOverlay.setDepth(-4)
    
    // Pulsing gold effect
    this.tweens.add({
      targets: goldOverlay,
      alpha: 0.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createVictoryDisplay(): void {
    const centerX = screenSize.width.value / 2
    
    // Victory banner - move down
    this.victoryBanner = this.add.image(centerX, 180, "victory_banner")
    this.victoryBanner.setScale(0.4)
    this.victoryBanner.setDepth(10)
    
    // Victory text based on winner
    let victoryText = ""
    let textColor = "#FFD700"
    
    if (this.victoryData.winner === 1) {
      victoryText = "PLAYER 1 WINS!"
      textColor = "#4A90E2" // Blue for player 1
    } else if (this.victoryData.winner === 2) {
      if (this.victoryData.gameMode === "1vAI") {
        victoryText = "AI WINS!"
        textColor = "#E24A4A" // Red for AI
      } else {
        victoryText = "PLAYER 2 WINS!"
        textColor = "#E24A4A" // Red for player 2
      }
    } else {
      victoryText = "IT'S A DRAW!"
      textColor = "#FFD700" // Gold for draw
    }
    
    const winnerText = this.add.text(centerX, 260, victoryText, {
      fontSize: "48px",
      fontFamily: "RetroPixel, Arial Black",
      color: textColor,
      stroke: "#000000",
      strokeThickness: 4,
      align: "center"
    })
    
    winnerText.setOrigin(0.5, 0.5)
    winnerText.setDepth(10)
    
    // Add explosion animation to winner text
    winnerText.setScale(0.1)
    this.tweens.add({
      targets: winnerText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      ease: 'Back.easeOut'
    })
    
    this.time.delayedCall(300, () => {
      this.tweens.add({
        targets: winnerText,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 200,
        ease: 'Bounce.easeOut'
      })
    })
    
    // Add continuous pulsing
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: winnerText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })
  }

  private createPlayerPoses(): void {
    const centerX = screenSize.width.value / 2
    const poseY = 420 // Position below victory text, above score
    
    if (this.victoryData.winner === 1) {
      // P1 wins: P1 victory pose, P2 defeat pose
      const player1Victory = this.add.image(centerX - 120, poseY, "player1_victory_pose")
      player1Victory.setScale(0.15)
      player1Victory.setOrigin(0.5, 1)
      player1Victory.setDepth(20) // Set to top layer
      
      const player2Defeat = this.add.image(centerX + 120, poseY, "player2_defeat_pose")
      player2Defeat.setScale(0.15)
      player2Defeat.setOrigin(0.5, 1)
      player2Defeat.setDepth(20) // Set to top layer
      
      // Add victory celebration animation to P1
      this.tweens.add({
        targets: player1Victory,
        y: poseY - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
    } else if (this.victoryData.winner === 2) {
      // P2 wins: P1 defeat pose, P2 victory pose
      const player1Defeat = this.add.image(centerX - 120, poseY, "player1_defeat_pose")
      player1Defeat.setScale(0.15)
      player1Defeat.setOrigin(0.5, 1)
      player1Defeat.setDepth(20) // Set to top layer
      
      const player2Victory = this.add.image(centerX + 120, poseY, "player2_victory_pose")
      player2Victory.setScale(0.15)
      player2Victory.setOrigin(0.5, 1)
      player2Victory.setDepth(20) // Set to top layer
      
      // Add victory celebration animation to P2
      this.tweens.add({
        targets: player2Victory,
        y: poseY - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
    } else {
      // Draw: Both players in friendly pose
      const playersDraw = this.add.image(centerX, poseY, "players_draw_pose")
      playersDraw.setScale(0.18)
      playersDraw.setOrigin(0.5, 1)
      playersDraw.setDepth(20) // Set to top layer
      
      // Add gentle swaying animation for draw
      this.tweens.add({
        targets: playersDraw,
        rotation: 0.05,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }
  }

  private createScoreDisplay(): void {
    const centerX = screenSize.width.value / 2
    const scoreY = 550 // Move score down to make room for player poses
    
    // Final score display
    const scoreText = this.add.text(centerX, scoreY, 
      `FINAL SCORE: ${this.victoryData.player1Score}  -  ${this.victoryData.player2Score}`, {
      fontSize: "32px",
      fontFamily: "RetroPixel, Arial Black",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center",
      lineSpacing: 10
    })
    
    scoreText.setOrigin(0.5, 0.5)
    scoreText.setDepth(10)
    
    // Add score animation
    scoreText.setAlpha(0)
    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 800,
      delay: 500,
      ease: 'Power2'
    })
  }

  private createButtons(): void {
    const centerX = screenSize.width.value / 2
    const restartButtonY = 620  // Top button (moved down)
    const backButtonY = 700     // Bottom button (moved down)
    
    // Restart button - make it much smaller and position vertically
    this.restartButton = this.add.image(centerX, restartButtonY, "restart_button")
    this.restartButton.setScale(0.2)  // Even smaller
    this.restartButton.setInteractive({ useHandCursor: true })
    this.restartButton.setDepth(10)
    
    // Back to menu button - make it much smaller and position vertically
    this.backButton = this.add.image(centerX, backButtonY, "back_button")
    this.backButton.setScale(0.2)  // Even smaller
    this.backButton.setInteractive({ useHandCursor: true })
    this.backButton.setDepth(10)
    
    // Button animations and handlers
    this.setupButtonInteractions(this.restartButton, () => this.restartGame())
    this.setupButtonInteractions(this.backButton, () => this.backToMenu())
    
    // Add separate floating animation for each button
    this.tweens.add({
      targets: this.restartButton,
      y: restartButtonY - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    this.tweens.add({
      targets: this.backButton,
      y: backButtonY - 5,
      duration: 2200,  // Slightly different timing for variety
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private setupButtonInteractions(button: Phaser.GameObjects.Image, clickCallback: () => void): void {
    const originalScale = button.scaleX
    
    // Hover effects
    button.on('pointerover', () => {
      button.setScale(originalScale * 1.1)
      this.buttonClickSound.play()
    })
    
    button.on('pointerout', () => {
      button.setScale(originalScale)
    })
    
    // Click effects
    button.on('pointerdown', () => {
      button.setScale(originalScale * 0.9)
    })
    
    button.on('pointerup', () => {
      button.setScale(originalScale * 1.1)
      clickCallback()
    })
  }

  private createCelebrationEffects(): void {
    // Create floating confetti effect
    for (let i = 0; i < 20; i++) {
      const confetti = this.add.rectangle(
        Phaser.Math.Between(0, screenSize.width.value),
        Phaser.Math.Between(-100, -50),
        Phaser.Math.Between(4, 12),
        Phaser.Math.Between(4, 12),
        Phaser.Math.RND.pick([0xFFD700, 0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xF9CA24])
      )
      
      confetti.setDepth(5)
      
      // Falling animation
      this.tweens.add({
        targets: confetti,
        y: screenSize.height.value + 50,
        duration: Phaser.Math.Between(3000, 6000),
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Linear',
        onComplete: () => confetti.destroy()
      })
      
      // Rotation
      this.tweens.add({
        targets: confetti,
        angle: 360,
        duration: Phaser.Math.Between(1000, 3000),
        repeat: -1,
        ease: 'Linear'
      })
    }
    
    // Add floating soccer balls
    for (let i = 0; i < 5; i++) {
      const celebrationBall = this.add.image(
        Phaser.Math.Between(50, screenSize.width.value - 50),
        Phaser.Math.Between(350, 550),
        "soccer_ball"
      )
      
      celebrationBall.setScale(0.08)
      celebrationBall.setDepth(-2)
      celebrationBall.setAlpha(0.6)
      
      // Floating animation
      this.tweens.add({
        targets: celebrationBall,
        y: celebrationBall.y - 30,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      // Rotation
      this.tweens.add({
        targets: celebrationBall,
        angle: 360,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        ease: 'Linear'
      })
    }
  }

  private setupAudio(): void {
    // Victory music
    this.victoryMusic = this.sound.add("victory_fanfare", {
      volume: audioConfig.musicVolume.value
    })
    
    // Button click sound
    this.buttonClickSound = this.sound.add("button_click", {
      volume: audioConfig.sfxVolume.value
    })
    
    // Play victory music
    this.victoryMusic.play()
  }

  private setupInput(): void {
    // R key to restart
    const rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    rKey.on('down', () => {
      this.restartGame()
    })
    
    // ESC key to go back to menu
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    escKey.on('down', () => {
      this.backToMenu()
    })
  }

  private restartGame(): void {
    console.log("🔄 RESTARTING GAME")
    
    this.buttonClickSound.play()
    this.victoryMusic.stop()
    
    // Transition effect
    const transitionRect = this.add.rectangle(
      screenSize.width.value / 2,
      screenSize.height.value / 2,
      screenSize.width.value,
      screenSize.height.value,
      0x000000,
      0
    )
    transitionRect.setDepth(100)
    
    this.tweens.add({
      targets: transitionRect,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start("GameScene")
      }
    })
  }

  private backToMenu(): void {
    console.log("🏠 BACK TO MENU")
    
    this.buttonClickSound.play()
    this.victoryMusic.stop()
    
    // Transition effect
    const transitionRect = this.add.rectangle(
      screenSize.width.value / 2,
      screenSize.height.value / 2,
      screenSize.width.value,
      screenSize.height.value,
      0x000000,
      0
    )
    transitionRect.setDepth(100)
    
    this.tweens.add({
      targets: transitionRect,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start("StartScene")
      }
    })
  }
}
