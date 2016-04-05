SpaceRun.MainMenu = function() {};

//extend the menu prototype
SpaceRun.MainMenu.prototype = {

	//In the create function, everything is run once at the beginning.
	create: function() {

		//Adding the first background image to the game. Setting the height to 500px.
		this.background = this.game.add.tileSprite(0, 0, this.game.width, 500, 'background');
		//Scroll the background on the X axis.
		this.background.autoScroll(-200, 0);

		//Adding the next background image near the bottom of the page.
		this.foreground = this.game.add.tileSprite(0, 500, this.game.width, this.game.height - 533, 'foreground');
		//Auto scroll again at the same speed.
		this.foreground.autoScroll(-200, 0);

		//Adding the very bottom ground sprite to the game and tiling it horizontally with a max height of 73px.
		this.ground = this.game.add.tileSprite(0, this.game.height - 73, this.game.width, 73, 'ground');
		//Auto scroll much faster to create a 'parallax' effect.
		this.ground.autoScroll(-450, 0);

		//Add the spaceship to the game using the spritesheet that was preloaded.
		//Positioning the X position to 200, and the Y to the middle.
		this.ship = this.add.sprite(200, this.game.height/2 + 75, 'ship');
		
		//Setting anchor point to the center of the sprite.
		this.ship.anchor.setTo(0.5);
		
		//Changing the starting angle to work with the 'up and down' tween used.
		//This is only used on the Main Menu, not in the game itself.
		this.ship.angle = -10;

		//Animating spachip by adding a new animation using the frames '0-3', and then reversing them (eg. 0,1,2,3 -> 2,1 -> then restarts on 0)
		this.ship.animations.add('fly', [0,1,2,3,2,1]);
		//Play the animation at 10fps and repeat
		this.ship.animations.play('fly', 10, true);

		//Adding tweens for the main menu only. This is for aesthetic effect.
		//First tween is the up and down movement. Offset is 150px and using Sinsoidal easing over 1 second. Delay is 610ms.
		this.game.add.tween(this.ship).to({y: this.ship.y - 150}, 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, Infinity, true);
		//Next tween is for rotation. Offset is 20 over 1 second with no delay so it looks 'flush' with the up and down movement.
		this.game.add.tween(this.ship).to({angle: this.ship.angle + 20}, 1000, Phaser.Easing.Sinusoidal.InOut, true, 500, Infinity, true);

		//Adding the splash sprite like in the preloader and setting anchor point
		this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
		this.splash.anchor.setTo(0.5);

		//Adding the bitmap text that was loaded. Choosing the fint and then the text to display.
		this.startText = this.game.add.bitmapText(0,0, 'Upheaval', 'Tap screen to begin!', 40);
		this.startText.anchor.setTo(0.5);
		this.startText.angle = -1;
		this.game.add.tween(this.startText.scale).to({x: 1.03, y: 1.03}, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, Infinity, true);
		this.game.add.tween(this.startText).to({angle: this.ship.angle + 12}, 600, Phaser.Easing.Sinusoidal.InOut, true, 0, Infinity, true);
		
		//Setting X and Y position for the text.
		this.startText.x = this.game.width/2;
		this.startText.y = this.game.height/2 + this.splash.height/2 + 50;

		//Importing cave sounds
		this.caveMusic = this.game.add.audio('cave');
		this.caveMusic.play('', 0, true, 1);

		//Was using a standard webfont -- not using this anymore.
		//this.game.add.text(this.game.width/2, this.game.height/2, 'Tap screen to begin!', {font: 'Lucida Console'});

	},

	//Constantly checking to see if the mouse was clicked or the screen was touched.
	update: function() {
		//On press, start the game state.
		if(this.game.input.activePointer.justPressed()) {
			this.caveMusic.stop();
			this.game.state.start('Game');
		}
	}
};