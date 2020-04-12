import { Component, OnInit } from '@angular/core';

import Phaser from 'phaser';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: [ WelcomeScene, GameScene, ScoreScene ],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 }
        }
      },
      backgroundColor: '#000033'
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }
}

class GameScene extends Phaser.Scene {
  delta: number;
  lastStarTime: number;
  starsCaught: number;
  starsFallen: number;
  sand: Phaser.Physics.Arcade.StaticGroup;
  info: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(): void {
    console.log('init method');
    this.delta = 1000;
    this.lastStarTime = 0;
    this.starsCaught = 0;
    this.starsFallen = 0;
  }

  create() {
    console.log('create method');
    this.sand = this.physics.add.staticGroup({
      key: 'sand',
      frameQuantity: 20
    });
    Phaser.Actions.PlaceOnLine(this.sand.getChildren(),
      new Phaser.Geom.Line(20, 580, 820, 580));
    this.sand.refresh();
    this.info = this.add.text(10, 10, '', { font: '24px Arial Bold', fill: '#FBFBAC' });
  }

  preload() {
    console.log('preload method');
    this.load.setBaseURL(
      'https://raw.githubusercontent.com/mariyadavydova/' +
      'starfall-phaser3-typescript/master/');
    this.load.image('star', 'assets/star.png');
    this.load.image('sand', 'assets/sand.jpg');
  }

  update(time: number): void {
    const diff: number = time - this.lastStarTime;
    if (diff > this.delta) {
      this.lastStarTime = time;
      if (this.delta > 500) {
        this.delta -= 20;
      }
      this.emitStar();
    }

    this.info.text = this.starsCaught + ' caught - ' + this.starsFallen + ' fallen (max 3)';
  }

  private onClick(star: Phaser.Physics.Arcade.Image): () => void {
    return function(): void {
      star.setTint(0x00ff00);
      star.setVelocity(0, 0);
      this.starsCaught += 1;
      this.time.delayedCall(100, () => {
        star.destroy();
      }, [star], this);
    };
  }

  private onFall(star: Phaser.Physics.Arcade.Image): () => void {
    return function() {
      star.setTint(0xff0000);
      this.starsFallen += 1;
      this.time.delayedCall(10, function() {
        star.destroy();
        if (this.starsFallen > 2) {
          this.scene.start('ScoreScene', { starsCaught: this.starsCaught });
        }
      }, [star], this);
    };
  }

  private emitStar(): void {
    let star: Phaser.Physics.Arcade.Image;
    const x = Phaser.Math.Between(25, 775);
    const y = 26;
    star = this.physics.add.image(x, y, 'star');
    star.setDisplaySize(50, 50);
    star.setVelocity(0, 200);
    star.setInteractive();
    star.on('pointerdown', this.onClick(star), this);
    this.physics.add.collider(star, this.sand, this.onFall(star), null, this);
  }
}

class WelcomeScene extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  hint: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: 'WelcomeScene'
    });
  }

  create(): void {
    const titleText = 'Starfall';
    this.title = this.add.text(150, 200, titleText, { font: '128px Arial Bold', fill: '#FBFBAC' });
    const hintText = 'Click to start';
    this.hint = this.add.text(300, 350, hintText, { font: '24px Arial Bold', fill: '#FBFBAC' });
    this.input.on('pointerdown', function(/*pointer*/) {
      this.scene.start('GameScene');
    }, this);
  }
}

class ScoreScene extends Phaser.Scene {
  score: number;
  result: Phaser.GameObjects.Text;
  hint: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: 'ScoreScene'
    });
  }

  init(params: any): void {
    this.score = params.starsCaught;
  }

  create(): void {
    const resultText: string = 'Your score is ' + this.score + '!';
    this.result = this.add.text(200, 250, resultText, { font: '48px Arial Bold', fill: '#FBFBAC' });
    const hintText = 'Click to restart';
    this.hint = this.add.text(300, 350, hintText, { font: '24px Arial Bold', fill: '#FBFBAC' });
    this.input.on('pointerdown', function(/*pointer*/) {
      this.scene.start('WelcomeScene');
    }, this);
  }
}
