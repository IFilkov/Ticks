const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1d1d1d",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [PreloadScene, GameScene, UIScene],
};
