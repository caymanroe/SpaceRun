
//This creates an instance of the game. The paramaters are the game width, height, the renderer to use, and where to place it on the page.
//Phaser.AUTO lets phaser decide what renderer to use.
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');

//Boot loads some global configurations for the game and some image assets for the preloader.
game.state.add('Boot', SpaceRun.Boot);

//Preloader loads all image, font, and audio assets for the game.
game.state.add('Preloader', SpaceRun.Preload);

//This is the main menu
game.state.add('MainMenu', SpaceRun.MainMenu);

//This is the normal game state.
game.state.add('Game', SpaceRun.Game);

//Initiate the boot state.
game.state.start('Boot');