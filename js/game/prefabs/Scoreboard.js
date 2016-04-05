var Scoreboard = function(game) {
	Phaser.Group.call(this, game);
};

//Inherit the Phaser group prototype
Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor - Scoreboard;

//Show method to display the score info
Scoreboard.prototype.show = function(score) {
	
	//Creating all the local variables.
	var rbmd, rbackground, bmd, background, gameoverText, scoreText, highScoreText, newHighScore, starText;

	//New bitmap Data type to create a new canvas for the red-out effect
	rbmd = this.game.add.bitmapData(this.game.width, this.game.height);

	//set fill style to red
	rbmd.ctx.fillStyle = '#ff0000';

	//fill the rectangle.
	rbmd.ctx.fillRect(0, 0, this.game.width, this.game.height);

	//Use background to hold the sprite/canvas that was just drawn
	rbackground = this.game.add.sprite(0, 0, rbmd);

	//Set opacity to 1
	rbackground.alpha = 1;

	//insert and tween opacity out
	game.world.add(rbackground);
	game.add.tween(rbackground).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 0, 0, false);

	//New bitmap Data type to create a new canvas.
	bmd = this.game.add.bitmapData(this.game.width, this.game.height);

	//set the fill style to black
	bmd.ctx.fillStyle = '#000';
	//fill the rectangle.
	bmd.ctx.fillRect(0, 0, this.game.width, this.game.height);

	//Use background to hold the sprite/canvas that was just drawn
	background = this.game.add.sprite(0, 0, bmd);
	//Set opacity to 50%
	background.alpha = 0.5;

	//Add the background.
	this.add(background);

	//Assume there is no high score.
	var isNewHighScore = false;

	//Using localstorage API of the browser to store the high score and retain.
	var highscore = localStorage.getItem('highscore');
	if(!highscore || highscore < score) {
		isNewHighScore = true;
		highscore = score;
		localStorage.setItem('highscore', highscore);
	}

	//Set y property to height of the game.
	this.y = this.game.height;

	//Adding bitmap text to the game containing Game Over message.
	gameoverText = this.game.add.bitmapText(0, 100, 'Upheaval', 'Game Over.', 36);
	gameoverText.x = this.game.width/2 - (gameoverText.textWidth/2);
	this.add(gameoverText);

	//Adding bitmap text to the game containing Score message.
	scoreText = this.game.add.bitmapText(0, 250, 'Upheaval', 'Your Score: ' + score, 24);
	scoreText.x = this.game.width/2 - (scoreText.textWidth/2);
	this.add(scoreText);

	//Adding bitmap text to the game containing High Score message.
	highScoreText = this.game.add.bitmapText(0, 325, 'Upheaval', 'Your High Score: ' + highscore, 24);
	highScoreText.x = this.game.width/2 - (highScoreText.textWidth/2);
	this.add(highScoreText);

	//Adding bitmap text to the game containing play again message.
	startText = this.game.add.bitmapText(0, 475, 'Upheaval', 'Tap to play again!', 25);
	startText.x = this.game.width/2;
	startText.tint = 0xffff99;
	this.add(startText);
	startText.anchor.setTo(0.5);
	startText.angle = -3;
	this.game.add.tween(startText.scale).to({x: 1.03, y: 1.03}, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, Infinity, true);
	this.game.add.tween(startText).to({angle: 4}, 600, Phaser.Easing.Sinusoidal.InOut, true, 0, Infinity, true);

	//If there is a new high score, display an extra message in the corner.
	if(isNewHighScore) {
		newHighScoreText = this.game.add.bitmapText(0, 160, 'Upheaval', 'New High Score!', 20);
		newHighScoreText.tint = 0x4ebef7; //Same as colour: #4ebef7
		newHighScoreText.x = gameoverText.x - gameoverText.textWidth + 40;
		//Set the angle to 28
		newHighScoreText.angle = -40;
		//Add to the scoreboard group
		this.add(newHighScoreText);
	}

	//Add a tween so the score board bounces up at the beginning.
	this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);

	//Use input controller to restart when clicked or pressed.
	//Using '.addOnce' so the game doesn't start multiple times if pressed multiple times.
	this.game.input.onDown.addOnce(this.restart, this);
};


Scoreboard.prototype.restart = function() {
	//Restart the game by setting the state to 'Game'
	this.game.state.start('Game', true, false);
};