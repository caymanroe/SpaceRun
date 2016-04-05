SpaceRun.Game = function() {

	//Setting the min and max angles for the spaceship.
	this.shipMinAngle = -20;
	this.shipMaxAngle = 20;

	//Every 900ms, generate a new diamond group
	this.diamondRate = 900;
	//Diamond timer user every game loop to check if a diamond was made.
	this.diamondTimer = 0;

	//Every 2000ms, generate a new fireball. This is slow at first but this speeds up over time.
	this.fireballRate = 2000;

	//Was trying to get the number fireballs to be dependant on the height of the screen..
	//This makes it fairer for someone with a very big screen... couldn't get it to work.
	//this.fireballRate = this.game.width/0.55;

	//Fireball timer user every game loop to check if a fireball was made.
	this.fireballTimer = 0;

	//reset score
	this.score = 0;

	//To begin, set previousDiamondType to null. This will change as game starts.
	this.previousDiamondType = null;
	this.diamondSpawnX = null;
	this.diamondSpacingX = 10;
	this.diamondSpacingY = 10;
};

//Extend the game prototype
SpaceRun.Game.prototype = {
	create: function() {

		//changing world bounds to be 300 extra pixels wide, so diamonds created off screen will not be killed automatically.
		this.game.world.bounds = new Phaser.Rectangle(0, 0, this.game.width + 300, this.game.height);

		//Reusing the a lot of elements from the Main Menu.
		//Adding the first background image to the game. Setting the height to 500px.
		this.background = this.game.add.tileSprite(0, 0, this.game.width, 512, 'background');
		//Scroll the background on the X axis.
		this.background.autoScroll(-200, 0);

		//Adding the next background image near the bottom of the page.
		this.foreground = this.game.add.tileSprite(0, 470, this.game.width, this.game.height - 533, 'foreground');
		//Auto scroll again at the same speed.
		this.foreground.autoScroll(-200, 0);
		
		//Adding the very bottom ground sprite to the game and tiling it horizontally with a max height of 73px.
		this.ground = this.game.add.tileSprite(0, this.game.height - 73, this.game.width, 73, 'ground');
		//Auto scroll much faster to create a 'parallax' effect.
		this.ground.autoScroll(-450, 0);
		
		//Add the spaceship to the game using the spritesheet that was preloaded.
		//Positioning the X position to 200, and the Y to the middle.
		this.ship = this.add.sprite(200, this.game.height/2 -100, 'ship');

		//Setting anchor point to the center of the sprite.
		this.ship.anchor.setTo(0.5);

		//I have the scale option included incase I need to change it.
		this.ship.scale.setTo(1)

		//Animating spachip by adding a new animation using the frames '0-3', and then reversing them (eg. 0,1,2,3 -> 2,1 -> then restarts on 0)
		this.ship.animations.add('fly', [0,1,2,1]);
		//Play the animation at 10fps and repeat
		this.ship.animations.play('fly', 10, true);

		//As outlined in the CA breif, here is the use of Arcade Physics.
		//Starting the physics syetem.
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		//Using the Arcade physics system, set gravity in Y direction to 1000
		this.game.physics.arcade.gravity.y = 1000;

		//adding physics to the ground (for use with colliding)
		this.game.physics.arcade.enableBody(this.ground);
		//stop the effect of gravity on ground
		this.ground.body.allowGravity = false;
		//Making it immobable when collided with.
		this.ground.body.immovable = true;

		//Adding physics to the space ship.
		this.game.physics.arcade.enableBody(this.ship);
		//Set the ship to collide with the world bounds. This stops the ship flying off the screen.
		this.ship.body.collideWorldBounds = true;
		//When the ship reaches the bounds, it bounces.
		this.ship.body.bounce.set(0.25);

		//creating groups that I can add diamonds and fireballs to
		this.diamonds = this.game.add.group();
		this.fireballs = this.game.add.group();

		//Adding score text to the top left of the screen
		this.scoreText = this.game.add.bitmapText(15, 15, 'Upheaval', 'Score: 0', 25);

		//Adding sounds to the game that were loaded in preloader.
		this.jetSound = this.game.add.audio('rocket');
		this.jetSoundOff = this.game.add.audio('rocketOff');
		this.diamondSound = this.game.add.audio('diamond');
		this.bounceSound = this.game.add.audio('bounce');
		this.deathSound = this.game.add.audio('death');
		this.gameMusic = this.game.add.audio('gameMusic');
		this.startup = this.game.add.audio('startup');

		//Start playing game music
		this.gameMusic.play('', 0, true, 1.5);
		this.startup.play();

		//Spawning thr diamonds groups 70px off screen so they have room to move in.
		this.diamondSpawnX = this.game.width + 70;
		
		//setting up variables for white-out at beginning of game
		var wbmd, wbackground;

		//New bitmap Data type to create a new canvas for the white-out effect
		wbmd = this.game.add.bitmapData(this.game.width, this.game.height);
	
		//set fill style to white
		wbmd.ctx.fillStyle = '#fff';
	
		//fill the rectangle.
		wbmd.ctx.fillRect(0, 0, this.game.width, this.game.height);
	
		//Use background to hold the sprite/canvas that was just drawn
		wbackground = this.game.add.sprite(0, 0, wbmd);
	
		//Set opacity to 1
		wbackground.alpha = 1;
	
		//insert and tween opacity out
		this.game.world.add(wbackground);
		this.game.add.tween(wbackground).to({alpha: 0}, 350, Phaser.Easing.Linear.None, true, 0, 0, false);



	},
	generateDiamonds: function() {

		if (!this.previousDiamondType || this.previousDiamondType < 3) {
			//set diamondType to random number, divided by 5 with the modulus. This is to guarntee a number between 0 and 4
			var diamondType = this.game.rnd.integer() % 5;
			switch(diamondType) {
				case 0:
					//Generate no diamonds
					break;
				case 1:
				case 2:
					//if diamond type is 1 or 2, create single diamond.
					this.createDiamond();
					break;
				case 3:
					//generate small diamond group for case 3
					this.createDiamondGroup(2, 2);
					break;
				case 4:
					//big group of diamonds for case 4
					this.createDiamondGroup(7, 2);
					break;
				default:
					//default should never be reached.. just incase
					this.previousDiamondType = 0;
					break;
			}
			//set previousDiamondType to what was just generated.
			this.previousDiamondType = diamondType;
		} else {
			//if the previousDiamondType is 4, skip the next gereration.
			//This is so if a large group of diamonds is generated, there will not be another large group right after.
			if(this.previousDiamondType === 4) {
				this.previousDiamondType = 3;
			} else {
				this.previousDiamondType = 0;
			}
		}

	},
	update: function() {

		//This is set up to increase the fireball spawn rate depending on the score.
		//Easyiest
		if(this.score > 10) {
			this.fireballRate = 1500;
		}
		//Easy
		if(this.score > 25) {
			this.fireballRate = 1000;
		}
		//Easy-Medium
		if(this.score > 30) {
			this.fireballRate = 700;
		}
		//Medium
		if(this.score > 40) {
			this.fireballRate = 500;
		}
		//Medium-Slightly Hard
		if(this.score > 60) {
			this.fireballRate = 425;
		}
		//Medium-Hard
		if(this.score > 100) {
			this.fireballRate = 330;
		}
		//Hard
		if(this.score > 150) {
			this.fireballRate = 250;
		}
		//Very Hard
		if(this.score > 200) {
			this.fireballRate = 200;
		}
		//Impossible. 10 fireballs a second. Ninja skills required.
		if(this.score > 250) {
			this.fireballRate = 100;
		}
		if(this.score > 300) {
			this.fireballRate = 70;
		}
		if(this.score > 350) {
		//20 fireballs a second. Endgame.
			this.fireballRate = 50;
		}
		//This would only be workable for beings of a higher form.. or with a 4K resolution...
		if(this.score > 400) {
			this.fireballRate = 25;
		}

		//This is to allow the player to pause the game.
		document.onkeydown = pause;
		function pause(e) {
		    e = e || window.event;
		    //If key pressed is 'p' or 'pause btn'...
		    if (e.keyCode == '80' ||e.keyCode == '19') {
		    	//If game isn't already paused..
		    	if (game.paused == false) {
		    		//Pause the game
		    		game.paused = true;
		    	} 
		    	else {
		    		//Unpause the game
		    		game.paused = false;
		    	}
		    }
		}

		//If the active pointer is pressed
		if(this.game.input.activePointer.isDown) {
			//increase ships y-velocity to -40. This moves it upwards.
			this.ship.body.velocity.y -= 40;

			//If the thruster sound isn't already playing, play it.
			if (!this.jetSound.isPlaying) {
				this.jetSound.play('', 0, true, 0.4);
			}
		} else {
			this.jetSound.stop();
		}

		//If the ship is moving up, or the player is trying to make the ship move upwards...
		if(this.ship.body.velocity.y < 0 || this.game.input.activePointer.isDown) {
			//and the ship is pointing down...
			if(this.ship.angle > 0) {
				//Set the angle to 0
				this.ship.angle = 0;
			}
			//and the angle is greater than the min allowed angle...
			if(this.ship.angle > this.shipMinAngle) {
				//Rotate the ship upwards.
				this.ship.angle -= 0.5;
			} 
			// If ship is moving down and the pointer isn't pressed...
		} else if(this.ship.body.velocity.y >= 0 && !this.game.input.activePointer.isDown) {
			//and the ship is less than the Max allowed angle...
			if(this.ship.angle < this.shipMaxAngle) {
				//Rotate the ship downwards.
				this.ship.angle += 0.5;
			}
		}
		//Setting up a timer, so generateDiamonds() is called every 900ms
		if(this.diamondTimer < this.game.time.now) {
			this.generateDiamonds();
			this.diamondTimer = this.game.time.now + this.diamondRate;
		}
		
		//Setting up a timer, so fireballs are created every 250ms
		if(this.fireballTimer < this.game.time.now) {
			this.createFireball();
			this.fireballTimer = this.game.time.now + this.fireballRate;
		}

		//setting up collision for the ship and the ground. Activate the groundHit method.
		this.game.physics.arcade.collide(this.ship, this.ground, this.groundHit, null, this);
		
		//Setting up collision for ship and diamonds. Activates the diamond hit method.
		this.game.physics.arcade.overlap(this.ship, this.diamonds, this.diamondHit, null, this);
		
		//Setting up collision for ship and fireballs. Activates the fireball hit method.
		this.game.physics.arcade.overlap(this.ship, this.fireballs, this.fireballHit, null, this);

	},
	//Shutdown is used to destroy all fireballs and diaminds, and reset scores and timers, to allow new sprites to be created.
	shutdown: function() {
		this.diamonds.destroy();
		this.fireballs.destroy();
		this.score = 0;
		this.diamondTimer = 0;
		this.fireballTimer = 0;
		//This basically resets the dificulty level.
		this.fireballRate = 2000;
	},
	createDiamond: function() {
		//Making the diamond appear on the far right.
		var x = this.game.width;
		//Set Y position to be random between 50 and height- 192
		var y = this.game.rnd.integerInRange(50, this.game.world.height - 192);

		//Get the first diamond that getFirstExists is false.
		var diamond = this.diamonds.getFirstExists(false);
		//If there's no diamond available, create a new one 
		if(!diamond) {
			diamond = new Diamond(this.game, 0, 0);
			this.diamonds.add(diamond);
		}
		//resetting the X and Y of the diamond
		diamond.reset(x, y);
		//revive is called, which sets the velocity to match that of the ground speed
		diamond.revive();
		return diamond;
	},
	createDiamondGroup: function(columns, rows) {
		//Setting the Y property on spawn to be random between 50 and height - 192
		var diamondSpawnY = this.game.rnd.integerInRange(50, this.game.world.height - 192);
		var diamondRowCounter = 0;
		var diamondColumnCounter = 0;
		var diamond;

		//for loop to run for however many diamonds are to be created in the group by multiplying the columns by the rows.
		for(var i = 0; i < columns * rows; i++) {

			//create a new diamond in the X and Y spawning positions as specified previously.
			diamond = this.createDiamond(this.spawnX, diamondSpawnY);

			//position the diamonds in the correct spacing by using a Column counter and multiplying by the width of the diamond.
			diamond.x = diamond.x + (diamondColumnCounter * diamond.width) + (diamondColumnCounter * this.diamondSpacingX);
			diamond.y = diamondSpawnY + (diamondRowCounter * diamond.height) + (diamondRowCounter * this.diamondSpacingY);
			//increment
			diamondColumnCounter++;
			if(i+1 >= columns && (i+1) % columns === 0) {
				diamondRowCounter++;
				diamondColumnCounter = 0;
			}
		}
	},
	createFireball: function() {
		//Making the fireball appear on the far right.
		var speed = -500;
		var x = this.game.width;
		//Set Y position to be random between 50 and height- 80
		var y = this.game.rnd.integerInRange(50, this.game.world.height - 80);

		//Get the first fireball that getFirstExists is false.
		var fireball = this.fireballs.getFirstExists(false);
		//If there's no fireball available, create a new one 
		if(!fireball) {
			fireball = new Fireball(this.game, 0, 0);
			this.fireballs.add(fireball);
		}
		//resetting the X and Y of the diamond
		fireball.reset(x, y);
		
		//revive is called to reset the movement and tweens etc.
		fireball.revive();
	},

	//When ship hits the ground
	groundHit: function(ship, ground) {
		//'bouncing' the ship back into the air.
		ship.body.velocity.y = -200;
		//Play the 'bang' sound on collision.
		this.bounceSound.play();
		
		//Testing to find a way to remove all visible fireballs, with the use of a possible powerup. Ignore below
		//this.fireballs.setAll('body.x', -60);
	},
	//When the ship hits a diamond
	diamondHit: function(ship, diamond) {
		//Increase score by 1
		this.score++;
		//PLay collect sound
		this.diamondSound.play();
		//Kill diamond to be collected and repositioned.
		diamond.kill();

		//Create dummy diamond for the use of an animation when collected.
		//Position it where the collected diamond was killed.
		var dummyDiamond = new Diamond(this.game, diamond.x, diamond.y);
		this.game.add.existing(dummyDiamond);

		//Tween the scale so it gets slightly bigger just after being collected.
		this.game.add.tween(dummyDiamond.scale).to({x: 0.6, y: 0.6}, 100, Phaser.Easing.Sinusoidal.InOut, true, 0, 0, true);

		//Play the spin animation faster than usual
		dummyDiamond.animations.play('spin', 40, true);

		//Tween the diamond to move it up the score text.
		var scoreTween = this.game.add.tween(dummyDiamond).to({x: 50, y: 50}, 300, Phaser.Easing.Circular.In, true);

		//When the positioning tween is complete, destroy the dummy diamond and increase the score.
		scoreTween.onComplete.add(function() {
			dummyDiamond.destroy();
			this.scoreText.text = 'Score: ' + this.score;
		}, this);
		
	},
	//When the ship hits a fireball
	fireballHit: function(ship, fireball) {
		//Kill the ship
		ship.kill();
		//kill the fireball
		fireball.kill();

		//Play the 'bomb' sound.
		this.deathSound.play();
		//Stop the game music
		this.gameMusic.stop();

		//Stop all scrolling
		this.ground.stopScroll();
		this.background.stopScroll();
		this.foreground.stopScroll();

		//Set the X velocity of all moving sprites to 0
		this.fireballs.setAll('body.velocity.x', 0);
		this.diamonds.setAll('body.velocity.x', 0);

		//Stop the generation of new fireballs or diamonds.
		this.fireballTimer = Number.MAX_VALUE;
		this.diamondTimer = Number.MAX_VALUE;

		//Showing the scoreboard.
		var scoreboard = new Scoreboard(this.game);
		scoreboard.show(this.score);
	}
}