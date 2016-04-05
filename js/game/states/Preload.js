SpaceRun.Preload = function() {
	//Assuming the preloader isn't ready/completed first
	this.ready = false;
};

//extend the preload prototype
SpaceRun.Preload.prototype = {
	preload: function() {
		//Adding the sprite/splashscreen for the logo to the game and centering it.
		this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');

		//Moving the anchor to the 50% of the width and 50% of the height. This centers the anchor point.
		this.splash.anchor.setTo(0.5);

		//adding the preload bar sprite and centering it, and lowering it just below the splash.
		this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');

		//centering anchor point
		this.preloadBar.anchor.setTo(0.5);

		//Assigns the preload bar to the preloadSprite. This tells Phaser to use it as the progress bar.
		//Phaser will clip the image depending on the percentage of data that has been transfered.
		this.load.setPreloadSprite(this.preloadBar);

		//Loading all scenery images
		this.load.image('ground', 'assets/images/ground.png');
		this.load.image('background', 'assets/images/cave.png');
		this.load.image('foreground', 'assets/images/foreground.png');

		//Loading all objects that are used in the game
		//The first parameter is the width of each frame, then the height, then the amount of frames in the spritesheet.
		this.load.spritesheet('diamonds', 'assets/images/diamond.png', 128, 128, 15);
		this.load.spritesheet('ship', 'assets/images/spaceship.png', 126, 51, 3);
		this.load.spritesheet('flames', 'assets/images/fireball.png', 446.5, 305, 4);

		//Loading all audio files used
		this.load.audio('gameMusic', ['assets/audio/game.mp3', 'assets/audio/game.ogg']);
		this.load.audio('rocket', 'assets/audio/rocket.wav');
		this.load.audio('bounce', 'assets/audio/bounce.wav');
		this.load.audio('diamond', 'assets/audio/collect.wav');
		this.load.audio('death', 'assets/audio/death.wav');
		this.load.audio('cave', 'assets/audio/cave.wav');
		this.load.audio('startup', 'assets/audio/start.wav');

		//Loading the bitmap font that is used in game. The XML tells Phaser the coordinates of each character.
		this.load.bitmapFont('Upheaval', 'assets/fonts/Upheaval/font.png', 'assets/fonts/Upheaval/font.xml')

		//Set this.ready to true inside onLoadComplete
		this.load.onLoadComplete.add(this.onLoadComplete, this);

	},
	create: function() {
		//Stops the preload bar from bugging out when the audio is decoding.
		this.preloadBar.cropEnabled = false;
	},
	//Update is run on every single 'request animation frame' or interval that Phaser uses.
	update: function() {
		//If music is decoded and preloader is done, start the menu state.
		if(this.cache.isSoundDecoded('gameMusic') && this.ready === true) {
			this.state.start('MainMenu');
		}
	},
	onLoadComplete: function() {
		//set ready to true when preloader finishes.
		this.ready = true;
	}
};