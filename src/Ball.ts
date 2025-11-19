import Phaser from "phaser"
import { ballConfig, audioConfig } from "./gameConfig.json"

export class Ball extends Phaser.Physics.Arcade.Sprite {
  private bounceSound!: Phaser.Sound.BaseSound
  private goalPostSound!: Phaser.Sound.BaseSound
  private standardSize = 25 // Standard ball size (reduced from 30)
  private targetBodyRadius: number = 25

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "soccer_ball")
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set depth to appear above goals (-3) and same level as players (1)
    this.setDepth(2)
    
    this.setupPhysics()
    this.setupSounds()
    this.setupBallSize()
  }

  private setupPhysics(): void {
    if (!this.body) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Set realistic gravity for natural ball physics
    body.setGravityY(400) // More realistic gravity for proper weight feeling
    
    // Set moderate bounce for natural ball behavior
    body.setBounce(0.7, 0.5) // More realistic bounce for satisfying physics
    
    // Enable world bounds collision - ball is now properly positioned above ground
    body.setCollideWorldBounds(true)
    
    // ZERO all friction and drag forces
    body.setDrag(0, 0) // Zero drag
    body.setFriction(0, 0) // Zero friction
    body.setAngularDrag(0) // Zero angular drag
    
    // Set circular collision body
    body.setCircle(this.standardSize)
    
    // Set higher velocity limits for more dynamic gameplay
    body.setMaxVelocity(1000, 800) // Higher horizontal speed for faster gameplay
    
    // STABILITY: Disable certain physics features that might cause jitter
    body.setImmovable(false) // Ensure it can be moved
    body.pushable = true // Allow pushing
  }

  private setupBallSize(): void {
    // Scale ball to smaller size (50px diameter, reduced from 60px)
    const ballDiameter = 50
    const originalSize = Math.min(this.width, this.height)
    const scale = ballDiameter / originalSize
    
    this.setScale(scale)
    this.setOrigin(0.5, 0.5)
    
    // Store the target physics size as instance variable
    this.targetBodyRadius = 25 // Reduced from 30 to match new diameter
    
    // Force physics body to exact size we want (will be enforced in update)
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body
      body.setCircle(this.targetBodyRadius)
      console.log(`Ball body set to: ${body.width}x${body.height}`)
    }
  }

  private setupSounds(): void {
    this.bounceSound = this.scene.sound.add("ball_bounce", { 
      volume: audioConfig.sfxVolume.value 
    })
    this.goalPostSound = this.scene.sound.add("goal_post_hit", { 
      volume: audioConfig.sfxVolume.value 
    })
  }

  public kick(force: Phaser.Math.Vector2, playerHeight: number, kickType: "normal" | "slide" | "jump" = "normal", distance: number = 100): void {
    if (!this.body) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    let finalForce = force.clone()
    
    // **ENHANCED KICK PHYSICS** - based on kick type and distance
    switch (kickType) {
      case "slide":
        // Slide tackle - powerful but low trajectory
        finalForce.scale(1.5) // More power
        finalForce.y *= 0.3 // Keep it low
        break
        
      case "jump":
        // Jump kick/header - high trajectory
        finalForce.y = Math.abs(finalForce.y) * -2.0 // Strong upward force
        finalForce.x *= 0.8 // Slightly less horizontal
        break
        
      case "normal":
      default:
        // Normal kick - adjust based on distance
        const distanceMultiplier = Math.min(distance / 150, 2.0) // Max 2x multiplier
        finalForce.scale(0.8 + distanceMultiplier * 0.4) // 0.8x to 1.2x power
        
        // **ENHANCED PARABOLIC TRAJECTORY** - more obvious arc
        const upwardBoost = Math.max(200, distance * 1.5) // Minimum 200px upward force
        finalForce.y = -upwardBoost // Always go up first for nice arc
        break
    }
    
    // Apply maximum speed limit
    const magnitude = finalForce.length()
    if (magnitude > ballConfig.maxSpeed.value * 1.2) { // Allow slightly higher max for kicks
      finalForce.normalize()
      finalForce.scale(ballConfig.maxSpeed.value * 1.2)
    }
    
    body.setVelocity(finalForce.x, finalForce.y)
    
    // **ENHANCED SPIN EFFECT** - more dramatic rotation
    const spinSpeed = magnitude * 0.02 // Doubled spin effect
    this.setAngularVelocity(force.x > 0 ? spinSpeed : -spinSpeed)
  }

  public onBounce(): void {
    // Play bounce sound with pitch variation
    if (this.body) {
      const velocity = (this.body as Phaser.Physics.Arcade.Body).velocity
      const impactStrength = Math.min(velocity.length() / 200, 1)
      
      if (impactStrength > 0.3) {
        this.bounceSound.play({
          volume: audioConfig.sfxVolume.value * impactStrength,
          rate: 0.8 + impactStrength * 0.4
        })
      }
    }
  }

  public onGoalPostHit(): void {
    this.goalPostSound.play()
    
    // Add screen shake effect through scene
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(200, 0.01)
    }
    
    // Add exaggerated bounce for goal posts
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body
      const currentVelocity = body.velocity
      
      // Exaggerate the bounce
      body.setVelocity(
        -currentVelocity.x * 1.2,
        -Math.abs(currentVelocity.y) * 0.8
      )
    }
  }

  public resetPosition(x: number, y: number): void {
    console.log(`⚽ BALL RESET TO KICKOFF: (${x}, ${y})`)
    
    this.setPosition(x, y)
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body
      body.setVelocity(0, 0)
      this.setAngularVelocity(0)
    }
    
    // Reset visual properties and stop animations
    this.clearTint()
    this.setAlpha(1)
    this.setRotation(0) // Reset rotation
    
    // **KEEP CORRECT BALL SIZE** - restore proper scale from setupBallSize
    const ballDiameter = 50
    const originalSize = Math.min(this.texture.source[0].width, this.texture.source[0].height)
    const correctScale = ballDiameter / originalSize
    this.setScale(correctScale)
    
    // Stop all tweens on the ball
    this.scene.tweens.killTweensOf(this)
    
    // Reset to original texture if needed
    this.setTexture("soccer_ball")
    
    console.log(`✅ BALL KICKOFF RESET COMPLETE: (${this.x}, ${this.y}) with correct scale: ${correctScale}`)
  }

  public update(): void {
    if (!this.body) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    const velocity = body.velocity
    
    // MANUAL BOUNDARY CHECK - prevent going off screen
    const margin = 25 // Ball radius
    if (this.x < margin) {
      this.x = margin
      body.setVelocityX(-velocity.x * 0.8) // Bounce back
    } else if (this.x > 1152 - margin) {
      this.x = 1152 - margin
      body.setVelocityX(-velocity.x * 0.8) // Bounce back
    }
    
    if (this.y < margin) {
      this.y = margin
      body.setVelocityY(-velocity.y * 0.8) // Bounce back
    }
    
    // STABILITY CHECK: Force stop micro-movements when ball is essentially stationary
    if (velocity.length() < 3) {
      body.setVelocity(0, 0)
      this.setAngularVelocity(0)
    }
  }

  public isMoving(): boolean {
    if (!this.body) return false
    const body = this.body as Phaser.Physics.Arcade.Body
    return body.velocity.length() > 20
  }

  public getVelocity(): Phaser.Math.Vector2 {
    if (!this.body) return new Phaser.Math.Vector2(0, 0)
    const body = this.body as Phaser.Physics.Arcade.Body
    return new Phaser.Math.Vector2(body.velocity.x, body.velocity.y)
  }
}
