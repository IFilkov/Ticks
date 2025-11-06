class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }
  updateHealthBar() {
    const width = (this.humanHealth / 100) * 160;
    this.healthBar.width = width;

    // цвет меняем по состоянию
    if (this.humanHealth > 60) this.healthBar.setFillStyle(0x00ff00);
    else if (this.humanHealth > 30) this.healthBar.setFillStyle(0xffff00);
    else this.healthBar.setFillStyle(0xff0000);

    this.healthText.setText(`HP: ${this.humanHealth}%`);
  }

  startWave() {
    this.ticksSpawned = 0;
    this.waveText.setText(`Wave ${this.wave}`);

    this.tickSpawner = this.time.addEvent({
      delay: this.spawnInterval,
      loop: true,
      callback: () => {
        if (this.ticksSpawned >= this.ticksToSpawn) {
          this.tickSpawner.remove();

          // Пауза между волнами
          this.time.delayedCall(2000, () => {
            this.wave++;
            this.ticksToSpawn = Math.floor(this.ticksToSpawn * 1.4);
            this.spawnInterval = Math.max(600, this.spawnInterval - 150);
            this.startWave();
          });

          return;
        }

        this.spawnTick();
        this.ticksSpawned++;
      },
    });
  }

  create() {
    this.add.image(400, 300, "sky");
    this.add.image(400, 300, "background");
    this.dog = this.physics.add.image("dog");
    this.tick = this.physics.add.image(400, 300, "tick");

    this.mouth = this.add.zone(this.dog.x + 16, this.dog.y).setSize(20, 20);
    this.physics.world.enable(this.mouth);
    this.mouth.body.setAllowGravity(false);
    this.mouth.body.setImmovable(true);

    // Человек
    this.humanHealth = 100;

    // UI: создаём полоску здоровья
    this.healthBarBg = this.add
      .rectangle(80, 20, 160, 20, 0x000000)
      .setOrigin(0.5);
    this.healthBar = this.add
      .rectangle(80, 20, 160, 20, 0x00ff00)
      .setOrigin(0.5);
    this.healthText = this.add.text(10, 35, "HP: 100%", {
      fontSize: "14px",
      fill: "#fff",
    });

    this.humanSpeed = 100;
    this.humanDirection = 1; // 1 = вправо, -1 = влево

    this.human = this.physics.add.sprite(100, 500, "man");
    this.human.body.allowGravity = false;

    // <-- ВАЖНО: убираем столкновение с границами,
    // иначе персонаж упирается и не может развернуться
    // this.human.setCollideWorldBounds(true);

    this.humanPaused = false;
    this.human.setVelocityX(this.humanSpeed * this.humanDirection);

    // Паузы
    this.time.addEvent({
      delay: 6000,
      loop: true,
      callback: () => {
        this.humanPaused = true;
        this.human.setVelocityX(0);

        this.time.delayedCall(4000, () => {
          this.humanPaused = false;
          this.human.setVelocityX(this.humanSpeed * this.humanDirection);
        });
      },
    });

    //Цикл пауз
    this.time.addEvent({
      delay: 6000,
      loop: true,
      callback: () => {
        this.humanPaused = true;
        this.human.setVelocityX(0);

        this.time.delayedCall(4000, () => {
          this.humanPaused = false;
          this.human.setVelocityX(this.humanSpeed * this.humanDirection);
        });
      },
    });

    // create()
    this.dog = this.physics.add.sprite(200, 550, "dog");
    this.dog.body.allowGravity = false;
    this.dog.setCollideWorldBounds(true);

    // Ввод
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Флаг прыжка
    this.isJumping = false;

    this.add.rectangle(40, 550, 5, 100, 0xff0000).setOrigin(0.5);
    this.add.rectangle(760, 550, 5, 100, 0xff0000).setOrigin(0.5);

    this.ticks = this.add.group();

    // Появление клещей каждые 1–2 секунды
    this.time.addEvent({
      delay: Phaser.Math.Between(1000, 2000),
      loop: true,
      callback: () => {
        this.spawnTick();
      },
    });

    // Настройки волн
    this.wave = 1;
    this.ticksToSpawn = 5; // сколько клещей в волне
    this.ticksSpawned = 0;
    this.spawnInterval = 1500; // ms между клещами в начале

    // Текст волны
    this.waveText = this.add
      .text(400, 20, "Wave 1", {
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Старт первой волны
    this.startWave();
  }

  update() {
    // Движение по горизонтали
    if (this.cursors.left.isDown) {
      this.dog.setVelocityX(-200);
      this.dog.flipX = false;
    } else if (this.cursors.right.isDown) {
      this.dog.setVelocityX(200);
      this.dog.flipX = true;
    } else {
      this.dog.setVelocityX(0);
    }

    // Прыжок
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && !this.isJumping) {
      this.isJumping = true;
      this.tweens.add({
        targets: this.dog,
        y: this.dog.y - 220,
        duration: 250,
        yoyo: true,
        ease: "Power2",
        onComplete: () => {
          this.isJumping = false;
        },
      });
    }

    // Границы экрана человека
    const leftBound = 40;
    const rightBound = 760;

    if (this.human.x >= rightBound) {
      this.humanDirection = -1;
      this.human.flipX = true;
    }

    if (this.human.x <= leftBound) {
      this.humanDirection = 1;
      this.human.flipX = false;
    }

    // Движение человека
    if (!this.humanPaused) {
      this.human.setVelocityX(this.humanSpeed * this.humanDirection);
    } else {
      this.human.setVelocityX(0);
    }

    // Рот следует за собакой
    this.mouth.x = this.dog.x + (this.dog.flipX ? -16 : 16);
    this.mouth.y = this.dog.y;

    // ✅ ЛОГИКА КЛЕЩЕЙ
    this.ticks.getChildren().forEach((tick) => {
      // Если клещ падает и касается рта — съеден
      if (
        tick.isFalling &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.mouth.getBounds(),
          tick.getBounds()
        )
      ) {
        tick.destroy();
        // TODO: добавить звук и анимацию укуса
        return;
      }

      // Если клещ падает и касается человека — урон
      if (
        tick.isFalling &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.human.getBounds(),
          tick.getBounds()
        )
      ) {
        this.humanHealth -= 10;
        this.updateHealthBar(); // ✅ обновляем UI
        tick.destroy();

        // Если здоровье кончилось — проиграли
        if (this.humanHealth <= 0) {
          this.humanHealth = 0;
          this.updateHealthBar();
          this.scene.pause();
          this.add
            .text(400, 300, "GAME OVER", { fontSize: "40px", color: "#ff0000" })
            .setOrigin(0.5);
        }
        return;
      }

      // Если долетел до пола — исчезает
      if (tick.y > 600) {
        tick.destroy();
      }
    });
  }

  spawnTick() {
    const startX = Phaser.Math.Between(50, 750);
    const startY = 600;

    const midY = 200;
    const endX = startX + Phaser.Math.Between(-200, 200);
    const endY = 600;

    const tick = this.add.sprite(startX, startY, "tick").setScale(0.8);

    // 👉 Важно: флаг состояния клеща
    tick.isFalling = false;

    this.tweens.add({
      targets: tick,
      x: {
        getStart: () => startX,
        getEnd: () => endX,
      },
      y: {
        getStart: () => startY,
        getEnd: () => endY,
      },
      ease: (t) => {
        const p = Phaser.Math.Easing.Quadratic.Out(t);
        return p;
      },

      onUpdate: (tween, target) => {
        const t = tween.progress;

        const yUp = Phaser.Math.Interpolation.Linear([startY, midY], t * 2);
        const yDown = Phaser.Math.Interpolation.Linear(
          [midY, endY],
          (t - 0.5) * 2
        );

        target.y = t < 0.5 ? yUp : yDown;

        // 👉 Когда t > 0.5 — клещ падает
        if (!target.isFalling && t > 0.5) {
          target.isFalling = true;
        }
      },

      duration: Phaser.Math.Between(1000, 1600),

      // 👉 Когда долетел до земли — удалить
      onComplete: () => {
        tick.destroy();
      },
    });

    // Добавим в группу, если ты её используешь для коллизий
    if (this.ticks) this.ticks.add(tick);
  }
}
// Логика обновления игры
