import Phaser from "phaser"
import LoadingScene from "./scenes/LoadingScene"
import StartScene from "./scenes/StartScene"
import GameScene from "./scenes/GameScene"
import VictoryScene from "./scenes/VictoryScene"
import { screenSize, debugConfig, renderConfig } from "./gameConfig.json"

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: screenSize.width.value,
  height: screenSize.height.value,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  loader: {
    // Disable Phaser's default loading screen to avoid delays
    crossOrigin: "anonymous",
  },
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      fps: 60, // Standard 60 FPS to match display refresh rate
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debugShowBody.value,
      debugShowStaticBody: debugConfig.debugShowStaticBody.value,
      debugShowVelocity: debugConfig.debugShowVelocity.value,
      gravity: { x: 0, y: 0 }, // No world gravity - players handle their own
      timeScale: 1.0, // Ensure consistent time scaling
      overlapBias: 4, // Reduce overlap detection sensitivity
      tileBias: 16, // Improve tile collision stability
    },
  },
  pixelArt: renderConfig.pixelArt.value,
  scene: [LoadingScene, StartScene, GameScene, VictoryScene],
  backgroundColor: "#000000", // Black background to avoid blue flash
}

export default new Phaser.Game(config)
