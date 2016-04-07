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

	//Speed of fireballs when starting
	this.fireSpeed = -500;

	//Speed of diamonds when starting
	this.diamondSpeed = -450;

	//Was trying to get the number fireballs to be dependant on the height of the screen..
	//This makes it fairer for someone with a very big screen... couldn't get it to work..
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

	//set floor speed
	this.floorSpeed = -450;
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
		this.background.autoScroll(this.floorSpeed+250, 0);

		//Adding the next background image near the bottom of the page.
		this.foreground = this.game.add.tileSprite(0, 470, this.game.width, this.game.height - 533, 'foreground');
		//Auto scroll again at the same speed.
		this.foreground.autoScroll(this.floorSpeed+250, 0);
		
		//Adding the very bottom ground sprite to the game and tiling it horizontally with a max height of 73px.
		this.ground = this.game.add.tileSprite(0, this.game.height - 73, this.game.width, 73, 'ground');
		//Auto scroll much faster to create a 'parallax' effect.
		this.ground.autoScroll(this.floorSpeed, 0);
		
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

		//Adding current level text to screen
		this.levelUpdate = this.game.add.bitmapText(this.game.width/2, this.game.height/2, 'Upheaval', 'Level 1', 30);
		this.levelUpdate.anchor.setTo(0.5);
		this.game.add.tween(this.levelUpdate).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 3000, 0, false);

		//Adding extra message
		this.levelMessage = this.game.add.bitmapText(this.game.width/2, this.game.height/2 + 35, 'Upheaval', '"Slow and steady"', 24);
		this.levelMessage.anchor.setTo(0.5);
		this.levelMessage.alpha = 0;

		//Tweening extra message to appear after a delay
		var messageOn = this.game.add.tween(this.levelMessage).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true, 1000, 0, false);

		//Tweening the message to disappear on complete of the previous tween
		messageOn.onComplete.add(function() {
			this.game.add.tween(this.levelMessage).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 1500, 0, false);
		}, this);

		//Adding sounds to the game that were loaded in preloader.
		this.jetSound = this.game.add.audio('rocket');
		this.jetSoundOff = this.game.add.audio('rocketOff');
		this.diamondSound = this.game.add.audio('diamond');
		this.bounceSound = this.game.add.audio('bounce');
		this.deathSound = this.game.add.audio('death');
		this.gameMusic = this.game.add.audio('gameMusic');
		this.startup = this.game.add.audio('startup');
		this.levelup = this.game.add.audio('levelup');

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

		this.diamondSpeed = this.floorSpeed;
		

		//--------------This is the leveling system--------------

		//Setting up the arrays that hold settings for each level
		//This is the floor speed
		var levelSpeed = [-550, -800, -450, -1200, -800, -600, -450, -850];
		//Secondary message under level number
		var levelMessage = ["Picking up the pace", "Let's stop this snail business", "Swarm Incoming!!!", "Yee-Haw! Hyperspeed!", "Let's collect ourselves...", "Did someone turn up the gravity?", "Super-fast fireballs inbound Captain", "Go for the high score!"];
		//Fireball speed
		var levelFireSpeed = [-600, -900, -550, -1300, -1000, -1100, -2200, -1150];
		//Fireball spawn rate
		var levelFireRate = [1000, 500, 100, 400, 400, 450, 800, 300];
		//Gravity level
		var levelGravity = [1000, 1000, 1000, 1000, 1000, 2000, 1000, 1000];

		//Enter if statement if score interval reached set 'i' accordingly depending on level.
		if (this.score >= 50 || this.score >= 115 || this.score >= 165 || this.score >= 190 || this.score >=205 || this.score >=280 || this.score >=305 || this.score >=330) {
			var i = 0
			if (this.score >=50) {
				i=0;
			}
			if (this.score >=115) {
				i=1;
			}
			if (this.score >=165) {
				i=2;
			}
			if (this.score >=190) {
				i=3;
			}
			if (this.score >=205) {
				i=4;
			}
			if (this.score >=280) {
				i=5;
			}
			if (this.score >=305) {
				i=6;
			}
			if (this.score >=330) {
				i=7;
			}
			//This ensures it only runs once when new score is reached.
			if(this.levelUpdate.text == 'Level '+(i+1)) {
				//Whiteout flash
				//whiteOut();
				//Add a delay so no fireballs or diamonds for 4 seconds.
				this.fireballRate = 4000;
				this.diamondRate = 4000;
				//Set up/display/tween text
				this.levelUpdate.text = 'Level '+(i+2);
				this.levelUpdate.alpha = 1;
				this.levelup.play();
				this.game.add.tween(this.levelUpdate).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 2000, 0, false);
				this.levelMessage.text = levelMessage[i];
				var messageOn = this.game.add.tween(this.levelMessage).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true, 1000, 0, false);

				//When tween finishes, update all speeds or all elements.
				messageOn.onComplete.add(function() {
					whiteOut();

					this.game.add.tween(this.levelMessage).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 1500, 0, false);
					this.fireSpeed = levelFireSpeed[i];
					this.fireballRate = levelFireRate[i];
					this.floorSpeed = levelSpeed[i];
					this.diamondRate = 900;
					this.diamondSpeed = this.floorSpeed;
					this.diamonds.setAll('body.velocity.x', this.fireSpeed);
					this.fireballs.setAll('body.velocity.x', levelFireSpeed[i]);
					this.background.autoScroll(this.floorSpeed+250, 0);
					this.foreground.autoScroll(this.floorSpeed+250, 0);
					this.ground.autoScroll(this.floorSpeed, 0);
					//Set gravity level
					this.game.physics.arcade.gravity.y = levelGravity[i];
				}, this);
			}

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

		//Whiteout function at the start of a new level
		function whiteOut() {
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
		}

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
		this.fireSpeed = -500;
		this.diamondSpeed = -450;
		this.floorSpeed = -450;
	},
	createDiamond: function() {
		//Making the diamond appear on the far right.

		var x = this.game.width;
		//Set Y position to be random between 50 and height- 192
		var y = this.game.rnd.integerInRange(50, this.game.world.height - 192);

		//Get the first diamond that getFirstExists is false.
		var diamond = this.diamonds.getFirstExists(false);
		//diamond.velocity.x = this.diamondSpeed;
		//If there's no diamond available, create a new one 
		if(!diamond) {
			diamond = new Diamond(this.game, 0, 0, this.diamondSpeed);
			this.diamonds.add(diamond);
		}
		//resetting the X and Y of the diamond
		diamond.reset(x, y);
		diamond.speed = this.diamondSpeed;
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
		var x = this.game.width;
		//Set Y position to be random between 50 and height- 80
		var y = this.game.rnd.integerInRange(50, this.game.world.height - 80);

		//Get the first fireball that getFirstExists is false.
		var fireball = this.fireballs.getFirstExists(false);
		//If there's no fireball available, create a new one 
		if(!fireball) {
			fireball = new Fireball(this.game, 0, 0, this.fireSpeed);
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