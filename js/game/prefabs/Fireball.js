var Fireball = function(game, x, y, key, frame) {

	//Setting key to 'flames', same as asset key in preload.
	key = 'flames';
	Phaser.Sprite.call(this, game, x, y, key, frame);

	//Set the scale to make it smaller
	this.scale.setTo(0.15);
	//Center the anchor point.
	this.anchor.setTo(0.5);

	//Creating a new animation called 'fire'. Fire will follow the default order of frames as specified in the preloader.
	this.animations.add('fire', [0,1,2,3,2,1]);
	//Enable as physics body for when the ship collides.
	this.game.physics.arcade.enableBody(this);
	
	//Making the collision box smaller to make the game easier. 
	//This means the ship has to fly directly into the fireball to die.
	//It can now 'get away' with scraping through it's trail.
	this.body.setSize(5, 5, 0, 0);
	
	//Don't want them to fall.. so turning off gravity.
	this.body.allowGravity = false;

	//On each frame.. check if fireball is in game world.
	this.checkWorldBounds = true;
	//If a fireball goes off screen, kill it.
	this.onOutOfBoundsKill = true;

	//Event for on revived. Specified at bottom of this file.
	this.events.onRevived.add(this.onRevived, this);
};

//Inherit the Fireball prototype from 'Phaser.Sprite.prototype'
Fireball.prototype = Object.create(Phaser.Sprite.prototype);
Fireball.prototype.constructor = Fireball;

//Fireball on revived method.
Fireball.prototype.onRevived = function() {
	//This is a tween that moves the fireball up and down slightly
	this.game.add.tween(this).to({y: this.y - 15}, 500, Phaser.Easing.Linear.NONE, true, 0, Infinity, true)
	//Setting the speed of the fireball
	this.body.velocity.x = -650;
	//Start the animation at 15fps
	this.animations.play('fire', 15, true);
};