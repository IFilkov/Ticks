class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("dog", "assets/images/ball.png");
    this.load.image("tick", "assets/images/tick.png");
    this.load.image("man", "assets/images/man.png");
    this.load.image("sky", "assets/images/sky.jpg");
    this.load.image("background", "assets/images/background.png");
    // this.load.audio("hit", "assets/audio/hit.wav");
  }

  create() {
    this.scene.start("GameScene");
  }
}
