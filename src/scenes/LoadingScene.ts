import Phaser from "phaser"
import { screenSize, audioConfig } from "../gameConfig.json"

export default class LoadingScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics
  private loadingBox!: Phaser.GameObjects.Graphics
  private loadingText!: Phaser.GameObjects.Text
  private percentText!: Phaser.GameObjects.Text
  private assetText!: Phaser.GameObjects.Text
  private loadingComplete = false
  private background!: Phaser.GameObjects.Graphics
  private overlay!: Phaser.GameObjects.Rectangle
  private soccerBallProgress!: Phaser.GameObjects.Graphics
  
  // Progress tracking for UI sync
  private currentProgress: number = 0
  private currentFile: string = ''
  private uiReady: boolean = false

  constructor() {
    super({
      key: "LoadingScene",
    })
  }

  init() {
    console.log("🎮 LoadingScene initialized - Phaser engine ready")
    
    // Create a simple initialization screen immediately
    this.createInitializationScreen()
  }

  preload() {
    console.log("🔄 Loading Scene started")
    
    // Clear initialization screen and create full loading UI
    this.children.removeAll()
    this.createLoadingUI()
    
    // Mark UI as ready immediately since we just created it
    this.uiReady = true
    console.log("🎯 Full loading UI created, replacing initialization screen")
    
    // Set up loading progress events (now UI is ready)
    this.setupLoadingEvents()
    
    // Load asset pack by type
    this.load.pack('assetPack', 'assets/asset-pack.json')
  }

  create() {
    console.log("✅ Loading Scene created")
    
    // UI was already created in preload(), just check if loading is complete
    if (this.loadingComplete) {
      console.log("🚀 Loading already complete, transitioning immediately")
      this.transitionToStartScene()
    }
    // Otherwise, transition will be triggered by the 'complete' event in setupLoadingEvents
  }

  private createLoadingUI(): void {
    const centerX = screenSize.width.value / 2
    const centerY = screenSize.height.value / 2

    // Create gradient background using graphics (no external dependencies)
    this.createGradientBackground()
    
    // Add floating footballs animation
    this.createFloatingFootballs()
    
    // Game logo/title at the top
    this.add.text(centerX, centerY - 180, 'ARCADE SOCCER', {
      fontSize: '56px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      stroke: '#ff6b35',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // Subtitle
    this.add.text(centerX, centerY - 120, 'Loading Game Assets...', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif', 
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // Loading bar background
    this.loadingBox = this.add.graphics()
    this.loadingBox.fillStyle(0x222222, 0.8)
    this.loadingBox.fillRoundedRect(centerX - 200, centerY - 20, 400, 40, 10)
    this.loadingBox.lineStyle(3, 0xffffff, 0.8)
    this.loadingBox.strokeRoundedRect(centerX - 200, centerY - 20, 400, 40, 10)

    // Loading bar fill
    this.loadingBar = this.add.graphics()

    // Soccer ball progress indicator (created with graphics)
    this.soccerBallProgress = this.add.graphics()
    this.drawSoccerBall(this.soccerBallProgress)
    this.soccerBallProgress.setPosition(centerX - 195, centerY)
    this.soccerBallProgress.setDepth(20)

    // Loading percentage text
    this.percentText = this.add.text(centerX, centerY, '0%', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // Loading status text
    this.loadingText = this.add.text(centerX, centerY + 60, 'Initializing...', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff6b35',
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // Current asset being loaded
    this.assetText = this.add.text(centerX, centerY + 90, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // Add pulsing animation to loading text
    this.tweens.add({
      targets: this.loadingText,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createFloatingFootballs(): void {
    // Create simple circle footballs as decorative elements
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, screenSize.width.value - 50)
      const y = Phaser.Math.Between(50, screenSize.height.value - 50)
      
      const football = this.add.graphics()
      football.fillStyle(0xffffff, 0.1)
      football.fillCircle(0, 0, 15)
      football.lineStyle(2, 0xffffff, 0.2)
      football.strokeCircle(0, 0, 15)
      
      // Add pentagon pattern
      football.lineStyle(1, 0xffffff, 0.15)
      for (let j = 0; j < 5; j++) {
        const angle = (j * 72) * Math.PI / 180
        const x1 = Math.cos(angle) * 8
        const y1 = Math.sin(angle) * 8
        const x2 = Math.cos(angle + 72 * Math.PI / 180) * 8
        const y2 = Math.sin(angle + 72 * Math.PI / 180) * 8
        football.lineBetween(x1, y1, x2, y2)
      }
      
      football.setPosition(x, y)
      
      // Floating animation
      this.tweens.add({
        targets: football,
        y: y - 30,
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000)
      })
      
      // Rotation animation
      this.tweens.add({
        targets: football,
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(8000, 12000),
        repeat: -1,
        ease: 'Linear'
      })
    }
  }

  private updateProgress(value: number): void {
    // This method is only called when uiReady is true, so elements should exist
    if (!this.percentText || !this.loadingBar || !this.soccerBallProgress || !this.loadingText) {
      console.warn("UI elements missing despite uiReady flag!")
      return
    }

    const percentage = Math.round(value * 100)
    console.log(`Updating UI progress to: ${percentage}%`)
    this.percentText.setText(`${percentage}%`)
    
    // Update loading bar
    this.loadingBar.clear()
    this.loadingBar.fillStyle(0xff6b35, 1)
    this.loadingBar.fillRoundedRect(
      screenSize.width.value / 2 - 195, 
      screenSize.height.value / 2 - 15, 
      390 * value, 
      30, 
      8
    )
    
    // Add gradient effect
    this.loadingBar.fillGradientStyle(0xff6b35, 0xff6b35, 0xff8c42, 0xff8c42, 1)
    this.loadingBar.fillRoundedRect(
      screenSize.width.value / 2 - 195, 
      screenSize.height.value / 2 - 15, 
      390 * value, 
      30, 
      8
    )

    // Update soccer ball position based on progress
    const ballStartX = screenSize.width.value / 2 - 195
    const ballEndX = screenSize.width.value / 2 + 195
    const ballX = ballStartX + (ballEndX - ballStartX) * value
    this.soccerBallProgress.setX(ballX)
    
    // Add rotation to the ball as it moves
    this.soccerBallProgress.setRotation(value * Math.PI * 4) // 2 full rotations over progress
    
    // Update status based on actual progress - more responsive
    if (percentage < 15) {
      this.loadingText.setText('Loading Fonts & UI...')
    } else if (percentage < 35) {
      this.loadingText.setText('Loading Player Animations...')
    } else if (percentage < 60) {
      this.loadingText.setText('Loading Game Assets...')
    } else if (percentage < 85) {
      this.loadingText.setText('Loading Audio Files...')
    } else if (percentage < 98) {
      this.loadingText.setText('Finalizing...')
    } else {
      this.loadingText.setText('Ready!')
    }
  }

  private setupLoadingEvents(): void {
    // Progress event with caching
    this.load.on('progress', (value: number) => {
      this.currentProgress = value
      console.log(`Loading progress: ${Math.round(value * 100)}%`)
      
      if (this.uiReady) {
        this.updateProgress(value)
      }
    })

    // File load event with caching
    this.load.on('fileprogress', (file: any) => {
      // Make file names more user-friendly
      let displayName = file.key
      if (file.key.includes('player1')) {
        displayName = `Messi ${file.key.split('_').pop()}`
      } else if (file.key.includes('player2')) {
        displayName = `Ronaldo ${file.key.split('_').pop()}`
      } else if (file.key.includes('audio') || file.key.includes('sound')) {
        displayName = `Audio: ${file.key}`
      } else if (file.key.includes('theme') || file.key.includes('music')) {
        displayName = `Music: ${file.key}`
      }
      
      this.currentFile = displayName
      console.log(`Loading file: ${displayName}`)
      
      if (this.uiReady && this.assetText) {
        this.assetText.setText(`Loading: ${displayName}`)
      }
    })

    // Complete event
    this.load.on('complete', () => {
      this.loadingComplete = true
      
      // Safety check for UI elements
      if (this.loadingText) {
        this.loadingText.setText('Loading Complete!')
      }
      if (this.assetText) {
        this.assetText.setText('Ready to Play!')
      }
      if (this.percentText) {
        this.percentText.setText('100%')
      }
      
      console.log("🎯 All assets loaded, transitioning to StartScene")
      
      // Natural fade transition without flash
      this.transitionToStartScene()
    })
  }


  private createGradientBackground(): void {
    const centerX = screenSize.width.value / 2
    const centerY = screenSize.height.value / 2
    
    // Create a soccer field-like gradient background using graphics
    this.background = this.add.graphics()
    
    // Create gradient from dark green to lighter green
    this.background.fillGradientStyle(0x0d4a0d, 0x0d4a0d, 0x228b22, 0x228b22, 1)
    this.background.fillRect(0, 0, screenSize.width.value, screenSize.height.value)
    this.background.setDepth(-10)
    
    // Add some field lines for soccer feel
    this.background.lineStyle(2, 0xffffff, 0.3)
    // Center line
    this.background.lineBetween(centerX, 0, centerX, screenSize.height.value)
    // Center circle
    this.background.strokeCircle(centerX, centerY, 100)
    
    // Add overlay for better text readability
    this.overlay = this.add.rectangle(centerX, centerY, screenSize.width.value, screenSize.height.value, 0x000000, 0.4)
    this.overlay.setDepth(-5)
  }

  private drawSoccerBall(graphics: Phaser.GameObjects.Graphics): void {
    // Draw a simple soccer ball with graphics
    graphics.clear()
    
    // Main ball circle (white)
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(0, 0, 12)
    
    // Add black outline
    graphics.lineStyle(1, 0x000000, 1)
    graphics.strokeCircle(0, 0, 12)
    
    // Black pentagon pattern - simplified approach
    graphics.fillStyle(0x000000, 1)
    
    // Draw central pentagon using beginPath
    graphics.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 90) * Math.PI / 180
      const x = Math.cos(angle) * 6
      const y = Math.sin(angle) * 6
      
      if (i === 0) {
        graphics.moveTo(x, y)
      } else {
        graphics.lineTo(x, y)
      }
    }
    graphics.closePath()
    graphics.fillPath()
    
    // Draw simple line pattern instead of complex hexagons
    graphics.lineStyle(1, 0x000000, 0.8)
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 90) * Math.PI / 180
      const x1 = Math.cos(angle) * 6
      const y1 = Math.sin(angle) * 6
      const x2 = Math.cos(angle) * 10
      const y2 = Math.sin(angle) * 10
      graphics.lineBetween(x1, y1, x2, y2)
    }
  }

  private createInitializationScreen(): void {
    const centerX = screenSize.width.value / 2
    const centerY = screenSize.height.value / 2
    
    // Create initialization background (simple and fast)
    const initBg = this.add.graphics()
    initBg.fillGradientStyle(0x0d4a0d, 0x0d4a0d, 0x228b22, 0x228b22, 1)
    initBg.fillRect(0, 0, screenSize.width.value, screenSize.height.value)
    initBg.setDepth(-10)
    
    // Simple title for initialization phase
    this.add.text(centerX, centerY - 50, 'ARCADE SOCCER', {
      fontSize: '48px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      stroke: '#ff6b35',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5)
    
    // Initialization status
    const initText = this.add.text(centerX, centerY + 20, 'Initializing Game Engine...', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5, 0.5)
    
    // Simple pulsing animation
    this.tweens.add({
      targets: initText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    console.log("🎯 Initialization screen created in init()")
  }

  private transitionToStartScene(): void {
    console.log("🚀 Transitioning to StartScene with natural fade")
    
    // Simple fade out transition - StartScene will have its own background
    const fadeRect = this.add.rectangle(
      screenSize.width.value / 2, 
      screenSize.height.value / 2, 
      screenSize.width.value, 
      screenSize.height.value, 
      0x000000, 
      0
    )
    fadeRect.setDepth(100)
    
    // Fade to black then start StartScene
    this.tweens.add({
      targets: fadeRect,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start("StartScene")
      }
    })
  }
}
