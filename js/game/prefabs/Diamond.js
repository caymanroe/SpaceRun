//New Diamond class. Takes a reference to the gane, x, y, key and frame
var Diamond = function(game, x, y, key, frame) {

	//Setting key to 'diamond', same as asset key in preload.
	key = 'diamonds';
	Phaser.Sprite.call(this, game, x, y, key, frame);

	//Set the scale to make it smaller
	this.scale.setTo(0.3);
	//Center the anchor point.
	this.anchor.setTo(0.5);

	//Creating a new animation called 'spin'. Spin will follow the default order of frames as specified in the preloader.
	this.animations.add('spin');

	//Enable as physics body for when the ship collects them.
	this.game.physics.arcade.enableBody(this);
	//I don't want them to fall.. so turning off gravity.
	this.body.allowGravity = false;

	//On each frame.. check if diamond is in game world.
	this.checkWorldBounds = true;
	//If a diamond goes off screen, kill it.
	this.onOutOfBoundsKill = true;

	//Events for on killed and on revived. Specified at bottom of this file.
	this.events.onKilled.add(this.onKilled, this);
	this.events.onRevived.add(this.onRevived, this);
};
//Inherit the Diamond prototype from 'Phaser.Sprite.prototype'
Diamond.prototype = Object.create(Phaser.Sprite.prototype);
Diamond.prototype.constructor = Diamond;

//Diamond on revived method.
Diamond.prototype.onRevived = function() {
	//When a diamond is revived, set speed to the same as the ground speed (450)
	this.body.velocity.x = -450;
	//Also play the spin animation.
	this.animations.play('spin', 20, true);
};
//On kill function
Diamond.prototype.onKilled = function() {
	//reset the frames on the animation so it's starting from the beginning.
	this.animations.frame = 0;
};