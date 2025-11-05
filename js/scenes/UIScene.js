class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.scoreText = this.add.text(10, 10, "Score: 0", {
      font: "20px Arial",
      fill: "#ffffff",
    });
  }
}
