import Phaser from "phaser"
import { screenSize, audioConfig } from "../gameConfig.json"

export default class StartScene extends Phaser.Scene {
  private backgroundMusic!: Phaser.Sound.BaseSound
  private buttonClickSound!: Phaser.Sound.BaseSound
  private gameStartSound!: Phaser.Sound.BaseSound
  private playButton!: Phaser.GameObjects.Image
  private titleText!: Phaser.GameObjects.Text
  private gameTitle!: Phaser.GameObjects.Image
  private background!: Phaser.GameObjects.Image
  private ball!: Phaser.GameObjects.Image
  
  constructor() {
    super({ key: "StartScene" })
  }

  preload(): void {
    console.log("🔄 START SCENE: Assets already loaded")
    // All assets are now loaded in LoadingScene
    // StartScene only uses already loaded assets
  }

  create(): void {
    // Create background
    this.createBackground()
    
    // Create title and UI elements
    this.createTitle()
    this.createPlayButton()
    this.createInstructions()
    this.createAnimatedElements()
    
    // Setup audio
    this.setupAudio()
    
    // Setup input
    this.setupInput()
    
    console.log("🎮 START SCENE: Created successfully")
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
    
    // Add overlay for better text readability
    const overlay = this.add.rectangle(centerX, centerY, screenSize.width.value, screenSize.height.value, 0x000000, 0.3)
    overlay.setDepth(-5)
  }

  private createTitle(): void {
    const centerX = screenSize.width.value / 2
    
    // Game title image
    this.gameTitle = this.add.image(centerX, 150, "game_title")
    
    // Scale title to be much bigger - increased from 0.9 to 1.2 screen width
    const maxTitleWidth = screenSize.width.value * 1.2
    const maxTitleHeight = 400  // Increased from 300 to 400
    
    // Calculate scale based on larger dimensions
    const scaleByWidth = maxTitleWidth / this.gameTitle.width
    const scaleByHeight = maxTitleHeight / this.gameTitle.height
    const finalScale = Math.min(scaleByWidth, scaleByHeight)
    
    this.gameTitle.setScale(finalScale)
    this.gameTitle.setDepth(10)
    
    console.log(`🏆 Title scaled to: ${finalScale.toFixed(2)}x (was limited by ${scaleByWidth < scaleByHeight ? 'width' : 'height'})`)
    
    // Add pulsing animation to title with larger pulse effect
    this.tweens.add({
      targets: this.gameTitle,
      scaleX: this.gameTitle.scaleX * 1.08, // Increased pulse from 1.05 to 1.08
      scaleY: this.gameTitle.scaleY * 1.08,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createPlayButton(): void {
    const centerX = screenSize.width.value / 2
    const centerY = screenSize.height.value / 2 + 50
    
    // Play button - make it much smaller
    this.playButton = this.add.image(centerX, centerY, "play_button")
    this.playButton.setScale(0.2)  // Much smaller
    this.playButton.setInteractive({ useHandCursor: true })
    this.playButton.setDepth(10)
    
    // Button hover effects
    this.playButton.on('pointerover', () => {
      this.playButton.setScale(0.22)
      this.buttonClickSound.play()
    })
    
    this.playButton.on('pointerout', () => {
      this.playButton.setScale(0.2)
    })
    
    // Button click handler
    this.playButton.on('pointerdown', () => {
      this.playButton.setScale(0.18)
    })
    
    this.playButton.on('pointerup', () => {
      this.playButton.setScale(0.22)
      this.startGame()
    })
    
    // Add floating animation
    this.tweens.add({
      targets: this.playButton,
      y: centerY - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createInstructions(): void {
    const centerX = screenSize.width.value / 2
    const bottomY = screenSize.height.value - 120
    
    // Instructions text
    const instructionsText = this.add.text(centerX, bottomY, 
      "Player 1: WASD + SPACE    Player 2: Arrow Keys + SHIFT\\n\\n" +
      "MOVE: Arrow Keys / WASD    JUMP: Up / W    SLIDE: Down / S    KICK: Space / Shift\\n\\n" +
      "Face the ball to kick properly - body contact will bounce the ball!", {
      fontSize: "14px",
      fontFamily: "RetroPixel, Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      align: "center",
      lineSpacing: 5,
      wordWrap: { width: screenSize.width.value - 100 }
    })
    
    instructionsText.setOrigin(0.5, 0.5)
    instructionsText.setDepth(10)
    
    // Add blinking animation for better visibility
    this.tweens.add({
      targets: instructionsText,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createAnimatedElements(): void {
    // Add floating soccer balls for decoration
    for (let i = 0; i < 3; i++) {
      const ballX = 100 + (i * 200)
      const ballY = 300 + (i % 2) * 100
      
      const decorBall = this.add.image(ballX, ballY, "soccer_ball")
      decorBall.setScale(0.1 + (i * 0.05))
      decorBall.setDepth(-1)
      decorBall.setAlpha(0.3)
      
      // Add rotation and floating
      this.tweens.add({
        targets: decorBall,
        angle: 360,
        duration: 5000 + (i * 1000),
        repeat: -1,
        ease: 'Linear'
      })
      
      this.tweens.add({
        targets: decorBall,
        y: ballY - 20,
        duration: 2000 + (i * 500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }
  }

  private setupAudio(): void {
    // Background music
    this.backgroundMusic = this.sound.add("soccer_theme", {
      volume: audioConfig.musicVolume.value,
      loop: true
    })
    
    // Sound effects
    this.buttonClickSound = this.sound.add("button_click", {
      volume: audioConfig.sfxVolume.value
    })
    
    this.gameStartSound = this.sound.add("game_start", {
      volume: audioConfig.sfxVolume.value
    })
    
    // Start background music
    this.backgroundMusic.play()
  }

  private setupInput(): void {
    // Space key to start game
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    spaceKey.on('down', () => {
      this.startGame()
    })
    
    // Enter key to start game
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    enterKey.on('down', () => {
      this.startGame()
    })
  }

  private startGame(): void {
    console.log("🚀 STARTING GAME!")
    
    // Play start sound
    this.gameStartSound.play()
    
    // Stop background music
    this.backgroundMusic.stop()
    
    // Add screen transition effect
    const transitionRect = this.add.rectangle(
      screenSize.width.value / 2, 
      screenSize.height.value / 2, 
      screenSize.width.value, 
      screenSize.height.value, 
      0x000000, 
      0
    )
    transitionRect.setDepth(100)
    
    // Fade to black then start game
    this.tweens.add({
      targets: transitionRect,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start("GameScene")
      }
    })
  }
}
