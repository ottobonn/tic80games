// title:  game title
// author: game developer
// desc:   short description
// script: js

var t=0;


function MovingObject() {
	this.position = new Vector(10, 10);
	this.velocity = new Vector(0, 0);
	this.heading = 0;
};

var p = new MovingObject();

p.draw = function() {
	var v = verts(this.position.x, this.position.y, 10, 10, this.heading);
	tri(v[0].x, v[0].y, v[1].x, v[1].y, v[2].x, v[2].y, 15);

	v = verts(this.position.x, this.position.y, 5, 5, this.heading);
	tri(v[0].x, v[0].y, v[1].x, v[1].y, v[2].x, v[2].y, 6);
}

p.startBurn = function(forward) {
	this.burning = true;
	this.forward = forward;
	this.burnStartTime = new Date();
	return (function() {
		this.burning = false;
		this.burnStartTime = undefined;
	}).bind(this);
}

p.update = function() {
	if (this.burning) {
		var scale = (this.forward ? 1 : -1) * 0.1;
		var thrustVector = new Vector(Math.cos(this.heading), Math.sin(this.heading)).scale(scale);
		this.velocity = this.velocity.add(thrustVector);
		var speed = Math.floor(this.velocity.length());
		var elapsedBurnTime = (new Date() - this.burnStartTime) / 1000;
		sfx(0, Math.floor(elapsedBurnTime * 10), 5);
	}
}

function verts(x, y, w, h, theta) {
	return [
		new Vector(0, -h/2).rotate((theta || 0) + Math.PI/2).translate(x || 0, y || 0),
		new Vector(w/2, h/2).rotate((theta || 0) + Math.PI/2).translate(x || 0, y || 0),
		new Vector(-w/2, h/2).rotate((theta || 0) + Math.PI/2).translate(x || 0, y || 0),
	];
}

function Particle() {
	this.position = new Vector(60, 10);
	this.velocity = new Vector(0, 1);
}
Particle.prototype.update = function() {
	this.position = this.position.add(this.velocity);
}
Particle.prototype.draw = function() {
	pix(this.position.x, this.position.y, 11);
}

function Button(number) {
	this.number = number;
	this.pressed = false;
	this.onPressedCallbacks = [];
	this.offPressedCallbacks = [];
}
Button.prototype.update = function() {
	if (btn(this.number)) {
		if (!this.pressed) {
			this.pressed = true;
			this.offPressedCallbacks = this.onPressedCallbacks.map(function(callback) {
				return callback(this) || (function() {});
			});
		}
	} else {
		if (this.pressed) {
			this.offPressedCallbacks.forEach(function(callback) {
				callback();
			});
		}
		this.pressed = false;
	}
}
Button.prototype.onPressed = function(callback) {
	this.onPressedCallbacks.push(callback);
}

var burnButton = new Button(0);
burnButton.onPressed(function() {return p.startBurn(true)});

var slowButton = new Button(1);
slowButton.onPressed(function() {return p.startBurn(false)});

var buttons = [burnButton, slowButton];
var particle = new Particle();

function TIC()
{
	cls(0);

	buttons.forEach(function(button) {
		button.update();
	});
	if (btn(2)) p.heading -= 0.05;
	if (btn(3)) p.heading += 0.05;

	p.update();

	var gravityVector = new Vector(0, 0.01);
	var windVector = new Vector(0.1 * Math.random() * Math.sin(Math.random() * t / 10), 0);
	p.velocity = p.velocity.add(gravityVector).add(windVector);
	p.position = p.position.add(p.velocity).add(gravityVector);

	particle.update();
	particle.draw();

	p.draw();
	t++;
}

function OVR() {
}

function Vector(x, y) {
  this.x = x;
	this.y = y;
}
Vector.prototype.normalize = function() {
	var l = this.length();
  return this.scale(1 / l);
}
Vector.prototype.scale = function(s) {
	return new Vector(this.x * s, this.y * s);
}
Vector.prototype.add = function(x, y) {
	if (arguments.length < 2) {
		y = x.y;
		x = x.x;
	}
	return new Vector(this.x + x, this.y + y);
}
Vector.prototype.subtract = function(x, y) {
	if (arguments.length < 2) {
		y = x.y;
		x = x.x;
	}
	return new Vector(this.x - x, this.y - y);
}
Vector.prototype.rotate = function(theta) {
	var l = this.length();
	var alpha = Math.atan2(this.y, this.x);
  return new Vector(
		l * Math.cos(alpha + theta),
		l * Math.sin(alpha + theta)
	);
};
Vector.prototype.translate = function(dx, dy) {
  return new Vector(
		this.x + dx,
		this.y + dy
	);
};
Vector.prototype.length = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

// <TILES>
// 001:efffffffff222222f8888888f8222222f8fffffff8ff0ffff8ff0ffff8ff0fff
// 002:fffffeee2222ffee88880fee22280feefff80fff0ff80f0f0ff80f0f0ff80f0f
// 003:efffffffff222222f8888888f8222222f8fffffff8fffffff8ff0ffff8ff0fff
// 004:fffffeee2222ffee88880fee22280feefff80ffffff80f0f0ff80f0f0ff80f0f
// 017:f8fffffff8888888f888f888f8888ffff8888888f2222222ff000fffefffffef
// 018:fff800ff88880ffef8880fee88880fee88880fee2222ffee000ffeeeffffeeee
// 019:f8fffffff8888888f888f888f8888ffff8888888f2222222ff000fffefffffef
// 020:fff800ff88880ffef8880fee88880fee88880fee2222ffee000ffeeeffffeeee
// </TILES>

// <SPRITES>
// 249:0007700000777700007aa700007aa700077aa770078aa870778aa87777777777
// 250:0070000007777000777a777007aaa877077aaa800078aa000077800000070000
// 251:00000077000077770777788777aaaaa777aaaaa7077778870000777700000077
// 252:00070000007780000078aa00077aaa8007aaa877777a77700777700000700000
// 253:77777777778aa877078aa870077aa770007aa700007aa7000077770000077000
// 254:000070000008770000aa870008aaa770778aaa700777a7770007777000000700
// 255:7700000077770000788777707aaaaa777aaaaa77788777707777000077000000
// </SPRITES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:030003000300030003000300030003000300030003000300030003000300030003000300030003000300030003000300030003000300030003000300300001000000
// </SFX>

// <PALETTE>
// 000:140c1c44243430346d4e4a4e854c30346524d04648757161597dced27d2c8595a16daa2cd2aa996dc2cadad45edeeed6
// </PALETTE>
