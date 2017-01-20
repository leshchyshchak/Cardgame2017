var Controller = function(){

	this.card = null;
	this.pointer = null;

	this.trail = game.add.emitter(0, 0);
	this.trail.maxParticles = 30;
	this.trail.gravity = 0;
	this.trail.lifespan = 600;
	this.shiftDuration = 100;
}

Controller.prototype.cardClick = function(card, pointer){
	if(!card.suit && card.suit !== 0)
		return;

	if(this.card){
		this.cardPutDown();
	}
	else{
		this.cardPickup(card, pointer);
	}
}

Controller.prototype.cardUnclick = function(card){
	if(!this.card || this.card != card)
		return;

	if(!this.clickedInbound() || this.clickTimedOut){
		this.cardPutDown();
	}
}

Controller.prototype.cardPickup = function(card, pointer){
	this.card = card;
	this.pointer = pointer;
	if(!this.card){
		console.error('Controller: cardPickup called but no Card assigned.');
		return
	}
	this.resetTrail();
	this.card.base.addAt(this.trail, 0);
	this.trail.position = {
		x: this.card.sprite.centerX,
		y: this.card.sprite.centerY
	}
	this.trail.minParticleSpeed.setTo(-this.card.sprite.width, -this.card.sprite.height);
	this.trail.maxParticleSpeed.setTo(this.card.sprite.width, this.card.sprite.height);

	this.trail.makeParticles('suits', this.card.suit);

	if(this.card.returner){
		this.card.returner.stop();
		this.card.returner = null;
	}
	this.shiftCardToCursor();
	cardsGroup.bringToTop(this.card.base);
}

Controller.prototype.spawnTrail = function(){
	var curTime = new Date().getTime();
	if(this.lastParticleTime && curTime - this.lastParticleTime < 20)
		return;

	this.lastParticleTime = curTime;

	var distance = this.card.sprite.position.distance(new Phaser.Point(this.trail.emitX, this.trail.emitY), true);
	if(distance < 2){
		this.trail.width = this.card.sprite.width - 35;
		this.trail.height = this.card.sprite.height - 35;
	}
	else{
		this.trail.width = this.trail.height = 0;
	}
	this.trail.emitX = this.card.sprite.x;
	this.trail.emitY = this.card.sprite.y;
	this.trail.emitParticle();
	this.trail.forEachAlive((p) => {
		p.alpha = p.lifespan / this.trail.lifespan * 0.6;
	})
}

Controller.prototype.shiftCardToCursor = function(){

	if(this.card.returner){
		this.card.returner.stop();
		this.card.returner = null;
	}

	this.shiftPosition = new Phaser.Point(
		this.pointer.x - this.card.base.x - this.card.sprite.x,
		this.pointer.y - this.card.base.y - this.card.sprite.y
	);
	this.shiftTime = new Date().getTime() + this.shiftDuration;
}

Controller.prototype.cardPutDown = function(){

	if(!this.card){
		console.error('Controller: cardPutDown called but no Card assigned.');
		return
	}

	if(this.validSpot() && this.pointer.button == Phaser.Mouse.LEFT_BUTTON){
		var x = this.card.base.x + this.card.sprite.x;
		var y = this.card.base.y + this.card.sprite.y;
		this.trail.position.x -= x - this.card.base.x; 
		this.trail.position.y -= y - this.card.base.y; 
		this.card.setBase(x, y);
		this.card.setRelativePosition(0, 0)
	}
	else{

		if(this.card.returner){
			this.card.returner.stop();
			this.card.returner = null;
		}

		this.card.returner = game.add.tween(this.card.sprite);
		this.card.returner.to({x:0, y:0}, 200, Phaser.Easing.Quadratic.Out);
		this.card.returner.onComplete.addOnce(() => {
			this.returner = null;
		}, this.card);

		this.card.returner.start();
	}
	this.card = null;
	this.pointer = null;
}

Controller.prototype.clickedInbound = function(){
	var cond = 
		this.pointer &&
		this.pointer.button == Phaser.Mouse.LEFT_BUTTON &&
		this.pointer.x >= this.card.base.x - this.card.base.width / 2 &&
		this.pointer.x <= this.card.base.x + this.card.base.width / 2 &&
		this.pointer.y >= this.card.base.y - this.card.base.height / 2 &&
		this.pointer.y <= this.card.base.y + this.card.base.height / 2
	return cond
}

Controller.prototype.validSpot = function(){
	return debugSpotValidity;
}

Controller.prototype.resetTrail = function(soft){
	this.trail.forEachAlive((p) => {
		if(soft)
			p.alpha = 0
		else{
			p.kill();
			p.reset();
		}
	})
	this.trail.position = {x: 0, y: 0};
}

Controller.prototype.reset = function(){
	this.resetTrail(true);
	this.card = null;
	this.pointer = null;
}

Controller.prototype.update = function(){
	if(this.card){
		if(!this.card.sprite.visible){
			this.reset();
			return;
		}
		if(this.pointer.button == Phaser.Mouse.RIGHT_BUTTON || !this.card.suit && this.card.suit !== 0){
			this.cardPutDown();
			return;
		}

		if(!this.card.returner){
			var sTime, sP, mP;
			sTime = this.shiftTime - new Date().getTime();
			if(sTime > 0){
				sP = new Phaser.Point(
					Math.round(this.shiftPosition.x / this.shiftDuration * sTime), 
					Math.round(this.shiftPosition.y / this.shiftDuration * sTime)
				);
			}
			else{
				sP = new Phaser.Point(0, 0);
			}
			mP = new Phaser.Point(this.pointer.x - this.card.base.x, this.pointer.y - this.card.base.y);
			this.card.setRelativePosition(mP.x - sP.x, mP.y - sP.y);
		}
		this.spawnTrail();
	}
}