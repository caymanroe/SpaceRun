//global game class
var SpaceRun = function() {};

//function for boot
SpaceRun.Boot = function() {};

//extending the boot prototype
SpaceRun.Boot.prototype = {

	//Loading the logo and loading bar for the preloader.
	preload: function() {
		this.load.image('logo', 'assets/images/logo.png');
		this.load.image('preloadbar', 'assets/images/loadingbar.png');
	},
	//Setting up some global configurations
	create: function() {

		//This disables multitouch.
		this.input.maxPointers = 1;
		
		//Setting the background color of the stage
		this.game.stage.backgroundColor = '#000';

		//Check if the game is being played on desktop or mobile.
		if (this.game.device.desktop) {
			//If desktop, horizontally align to it appears centered.
			this.scale.pageAlignHorizontally = true;
		} else {
			//If mobile, manually configuring..
			//Do not scale to all elements show
			//this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
			this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			
			//Setting minimum width, height and maximum width height.
			this.scale.minWidth = 568;
			this.scale.minHeight = 600;
			this.scale.maxWidth = 2048;
			this.scale.maxHeight = 1536;
			
			//Force the game to run landsape
			this.scale.forceLandscape = true;
			this.scale.pageAlignHorizontally = true;
			this.scale.updateLayout(true);
		}

		//Initiate the preloader state.
		this.state.start('Preloader');

	}

};