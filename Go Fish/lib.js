var mouse = {
	x: 0,
	y: 0,
	clicked: false,
	upClick: true,
};
document.addEventListener('mousemove', function(e){
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

document.onmousedown = function() { 
    mouse.clicked = true;
}
document.onmouseup = function() {
    mouse.clicked = false;
    added = false;
    mouse.upClick = true;
}


var cardNames = ['jack', 'queen', 'king', 'ace'];
var cardColors = ['clubs', 'diamonds', 'hearts', 'spades'];

var fishCards = [];

function isLineIntersecting(p1, p2, p3, p4){
	//line intersection

	var l1dx = (p2.x - p1.x),
		l1dy = (p2.y - p1.y),
		l2dx = (p4.x - p3.x),
		l2dy = (p4.y - p3.y);

	var denominator = l1dx * l2dy - l1dy * l2dx,
		numerator1 =  (p1.y - p3.y) * l2dx - (p1.x - p3.x) * l2dy;
		numerator2 =  (p1.y - p3.y) * l1dx - (p1.x - p3.x) * l1dy;

	//error.. (coincident lines)
	if(denominator == 0) return numerator1 == 0 && numerator2 == 0;

	var r = numerator1 / denominator,
		s = numerator2 / denominator;
	return (r >= 0 && r <= 1) && (s >= 0 && s <= 1); //its intersecting! :D
}

var Vector = function(x, y){
	var vector = new Object(this);
	vector.x = x;
	vector.y = y;
	vector.addTo = function(v2){
		vector.x += v2.x;
		vector.y += v2.y;
	};
	vector.getAngle = function(){
		return Math.atan2(vector.y, vector.x);
	};
	vector.getAngle2 = function(v2){
		return new Line(vector, v2).getAngle();
	};
	vector.getLength = function(){
		return Math.sqrt(vector.x * vector.x, vector.y * vector.y);
	};
	vector.setAngle = function(angle){
		var l = vector.getLength();
		vector.x = Math.cos(angle) * l;
		vector.y = Math.sin(angle) * l;
	};
	vector.setLength = function(length){
		var angle = vector.getAngle();
		vector.x = Math.cos(angle) * length;
		vector.y = Math.sin(angle) * length;
	};
	vector.distance = function(v2){
		var dx = v2.x - vector.x,
			dy = v2.y - vector.y;
		return Math.sqrt(dx * dx + dy * dy);
	};
	vector.clone = function(){
		return new Vector(vector.x, vector.y);
	};
	return vector;
};

var Line = function(v1, v2){
	var line = new Object(this);
	line.v1 = new Vector(v1.x, v1.y);
	line.v2 = new Vector(v2.x, v2.y);

	line.getLength = function(){
		var dx = line.v1.x - line.v2.x,
			dy = line.v1.y - line.v2.y;
		return Math.sqrt(dx * dx + dy * dy);
	};
	line.setLength = function(length){
		var angle = line.getAngle();
		line.v2 = new Vector(Math.cos(angle), Math.sin(angle));
		line.v2.multiplicate(length);
		line.v2.addTo(new Vector(line.v1.x, line.v1.y));
	};
	line.getCenter = function(){
		return new Vector((line.v1.x + line.v2.x)/2, (line.v1.y + line.v2.y)/2);
	};
	line.intersect = function(line2){
		return isLineIntersecting(line.v1, line.v2, line2.v1, line2.v2);
	};
	line.getAngle = function(){
		var dx = line.v2.x - line.v1.x,
			dy = line.v2.y - line.v1.y;
		return Math.atan2(dy, dx);
	};

	line.setAngle = function(angle){
		angle *= -1;
		var length = line.getLength();
		line.v2.setAngle(angle);
		line.v2.setLength(length);
		line.v2.addTo(new Vector(line.v1.x, line.v1.y));
	};
	line.render = function(ctx){
		ctx.beginPath();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.moveTo(line.v1.x, line.v1.y);
		ctx.lineTo(line.v2.x, line.v2.y);
		ctx.stroke();
		ctx.closePath();
	}
	return line;
};
var Circle = function(x, y, r){
	var circle = new Object(this);
	circle.c = new Vector(x, y);
	circle.r = r;
	circle.update = function(v2){
		circle.center = v2;
	};
	circle.collision = function(pos){
		if(pos.distance(circle.c) <= circle.r){
			return true;
		}
		return false;
	}
	circle.circle_collision = function(c2){
		if(c2.c.distance(circle.c) <= circle.r + c2.r){
			return true;
		}
		return false;
	}
	circle.render = function(ctx){
		ctx.beginPath();
		ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2);
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.closePath();
	}
	return circle;
};

var Card = function(x, y){
	var card = new Object(this);
	this.color = cardColors[y];
	if(x > 8)
		this.name = cardNames[x - 9];
	else
		this.name = x + 2;
	this.value = {'x': x, 'y': y};

	return card;
};
var Polynom = function(l, c, rot, sprite){
	var polynom = new Object(this);
	this.color = '#000';
	this.rot = rot;
	this.l = l * 3;
	this.sprite = $.extend(true, {}, sprite);

	polynom.setup = function(c, rot){
		this.corners = [
			new Vector(c.x - this.sprite.w/2, c.y - this.sprite.h/2),
			new Vector(c.x - this.sprite.w/2, c.y + this.sprite.h/2),
			new Vector(c.x + this.sprite.w/2, c.y + this.sprite.h/2),
			new Vector(c.x + this.sprite.w/2, c.y - this.sprite.h/2)
		]

		this.vertexes = [];

		for(var i = 0; i < 4; i++){
			var angle = c.getAngle2(this.corners[i]) + rot;
			this.vertexes.push(new Vector(0, 0));

			this.vertexes[i].setLength(l);
			this.vertexes[i].setAngle(angle);

			this.vertexes[i].addTo(c);
		}
	}
	polynom.setup(c, rot);

	polynom.collision = function(line){
		line.setAngle(this.rot + Math.PI / 6);

		var count = 0;
		for(var i = 0; i < 4; i++){
			var index = (i != 3) ? (i+1): 0;
			var sLine = new Line(this.vertexes[i], this.vertexes[index]);

			if(line.intersect(sLine)) {
				count++;
			}
		}

		if(count % 2 != 0){
			//collision
			this.color = '#0022FF';
			return true;
		}
		else {
			//no collision
			this.color = '#000';
			return false;
		}
	}

	polynom.render = function(ctx){
		for(var i = 0; i < 4; i++){
			ctx.beginPath();
			ctx.moveTo(this.vertexes[i].x, this.vertexes[i].y);
			var m = (i != 3) ? (i+1) : 0;
			ctx.lineTo(this.vertexes[m].x, this.vertexes[m].y);
			ctx.lineWidth = (this.color == '#000') ? 1 : 3;
			ctx.strokeStyle = this.color;
			ctx.stroke();
			ctx.closePath();
		}
	}
	return polynom;
}

var displayCard = function(rot, center, sprite, card){
	var obj = new Object(this);

	obj.l = Math.sqrt((sprite.w * sprite.w + sprite.h * sprite.h) / 4);
	obj.circle = new Circle(center.x, center.y, obj.l);
	obj.rot = rot;
	obj.sprite = $.extend(true, {}, sprite);
	obj.polynom = new Polynom(obj.l, obj.circle.c, rot, obj.sprite);
	obj.card = card;


	obj.render = function(ctx){
		ctx.beginPath();
		ctx.save();
		ctx.translate(obj.circle.c.x, obj.circle.c.y);
		ctx.rotate(obj.rot);
		ctx.drawImage(backImage, 0 - sprite.w/2, 0 - sprite.h/2, sprite.w, sprite.h);
		ctx.restore();
		ctx.closePath();

		obj.polynom.render(ctx);
		// obj.circle.render(ctx);
	}
	return obj;
}



var AI = function(dif){
	var ai = new Object(this);

	ai.difuculty = dif;
	ai.pairs = [];
	ai.findPair = [];
	ai.lastPicked = 'error';
	ai.playerSelected = [];

	ai.startUp = function(){
		for(var i = 0; i < 7; i++){
			ai.goFish();
		}
	}
	ai.resetIndex = function(){
		for(var i = 0; i < ai.pairs.length; i++){
			ai.findPair[ai.pairs[i].name].index = i;
		}
	}

	ai.pickCard = function(){
		var winner = ai.setPoints();
		ai.pairs[winner.index].selected++;
		console.log('ai is going to ask for ' + ai.pairs[winner.index].name);
		var ret = hand.request(ai.pairs[winner.index].name);
		ai.lastPicked = ai.pairs[winner.index].name;

		infoText = 'Computer is asking for ' + ai.pairs[winner.index].name;
		infoTimer = 0;

		if(ret == 'go fish'){
			ai.goFish();
			turn = 0;
		}
		else {
			console.log(ret);
			for(var i = 0; i < ret.length; i++){
				ai.addCard(ret[i].cardInfo.name);
			}
			// now there should be a time delay.. (so player can see what the fuck happened)
			console.log('ai requested good cards');
		}
	}
	ai.getCard = function(cardType){
		var i = ai.findPair[cardType];
		console.log('player want: '+cardType);

		if(i !== undefined){
			var cards = $.extend(true, [], ai.pairs[i.index].cards);
			ai.playerSelected[ai.pairs[i.index].name] = 10; // just a value
			delete ai.findPair[ai.pairs[i.index].name];
			ai.pairs.splice(i.index, 1);
			// console.log('returned the cards');

			ai.resetIndex();
			return cards;
		}
		else {
			// console.log(i);
			// console.log(ai.findPair);
			ai.playerSelected[cardType] = 10; // just a value
			console.log('go fish player');
			return 'go fish';
		}
	}
	ai.goFish = function(e){
		

		if(displayCards.length > 0){
			var index = Math.round((displayCards.length - 1) * Math.random());
			var card = displayCards[index].card;
			ai.addCard(card);

			displayCards.splice(index, 1);
			if(typeof(e) === undefined){
				turn = 0; // set it back
			}
		}
		else {
			turn = 0;
		}
	}
	ai.addCard = function(card){
		if(!ai.findPair[card.name]){
			ai.findPair[card.name] = {index: ai.pairs.length};
			ai.pairs.push({
				name: card.name,
				cards: [card],
				point: 0,
				selected: 0
			});

		}
		else {
			var i = ai.findPair[card.name].index;
			ai.pairs[i].cards.push(card);
			if(ai.pairs[i].cards.length == 4){
				aiScore++;
				ai.pairs.splice(i, 1);
				delete ai.findPair[card.name];
				
				ai.resetIndex();
			}
		}
	}
	ai.setPoints = function(){
		//here is the magic done..
		var hasPlayerCard = false;
		var trees = [], seconds = [];

		for(var i = 0; i < ai.pairs.length; i++){
			ai.pairs[i].point = 0;//reset from beginning
			ai.pairs[i].point += ai.pairs[i].cards.length - ai.pairs[i].selected;

			if(ai.playerSelected[ai.pairs[i].name]){
				hasPlayerCard = i;
				break;
			}

			if(ai.pairs[i].point == 3){
				trees.push(i);//get the index
			}
			else if(ai.pairs[i].point == 2){
				seconds.push(i);
			}
		}
		var winner = {index: -1, point: 0};
		if(!hasPlayerCard){
			for(var i = 0; i < trees.length; i++){
				var point = 2 / trees.length;
				ai.pairs[trees[i]].point += point;
			}
			for(var i = 0; i < seconds.length; i++){
				var point = 1 / seconds.length;
				ai.pairs[seconds[i]].point += point;
			}
			if(ai.findPair[ai.lastPicked]){
				ai.pairs[ai.findPair[ai.lastPicked].index].point -= 2;
			}

			for(var i = 0; i < ai.pairs.length; i++){
				if(ai.pairs[i].point > winner.point || winner.index == -1){
					winner.index = i;
					winner.point = ai.pairs[i].point;
				}
			}
		}
		else {
			delete ai.playerSelected[ai.pairs[hasPlayerCard].name]; //now delete this ofcourse
			winner.index = hasPlayerCard;
		}
		return winner;
	}

	return ai;
}

var handCard = function(card, sprite, rot, pos, posData){
	var obj = new Object(this);
	obj.posData = $.extend(true, {}, posData);

	obj.sprite = $.extend(true, {}, sprite);
	obj.cardInfo = {
		name: card.name,
		color: card.color,
		x: card.value.x,
		y: card.value.y
	}
	obj.rot = rot;
	obj.pos = pos.clone();


	obj.l = Math.sqrt((sprite.w * sprite.w + sprite.h * sprite.h) / 16);
	obj.circle = new Circle(pos.x, pos.y, obj.l);
	obj.polynom = new Polynom(obj.l, obj.circle.c, rot, obj.sprite);


	obj.render = function(ctx){
		ctx.beginPath();
		ctx.save();
		ctx.translate(Math.cos(obj.rot) * obj.posData.r + obj.posData.w, Math.sin(obj.rot) * obj.posData.l + obj.posData.h); 
		ctx.rotate(0);//obj.rot);

		var sx = obj.cardInfo.x * obj.sprite.w,
			sy = obj.cardInfo.y * obj.sprite.h,
			w = obj.sprite.w,
			h = obj.sprite.h,
			x = 0 - obj.sprite.w / 4,
			y = 0 - obj.sprite.h / 4;

		ctx.drawImage(deckImage, sx, sy, w, h, x, y, w * 0.5, h * 0.5); // cropped to its cordinates
		ctx.restore();
		ctx.closePath();

		obj.polynom.render(ctx);
	}


	return obj;
}

var Hand = function(){
	var hand = new Object(this);
	hand.cardsize = 0;
	hand.pairs = [];
	hand.findPairs = [];

	hand.arange = function(){
		var k = 1;
		for(var i = 0; i < hand.pairs.length; i++){
			for(var j = 0; j < hand.pairs[i].cards.length; j++){
				var angle = Math.PI / hand.cardsize * k;
				k++;
				var win = {w: window.innerWidth, h: window.innerHeight};
				var r = win.w * 0.2 + win.w * 0.3 / hand.cardsize,
					h = win.h * 0.15 + win.h * 0.1 / hand.cardsize;
				var pos = new Vector(Math.cos(angle) * -r + win.w/2, Math.sin(angle) * -h + win.h);

				hand.pairs[i].cards[j].pos = pos.clone();
				hand.pairs[i].cards[j].posData.r = -r;
				hand.pairs[i].cards[j].posData.l = -h;
				hand.pairs[i].cards[j].rot = angle;
				hand.pairs[i].cards[j].circle.c = pos.clone();



				hand.pairs[i].cards[j].polynom.setup(pos.clone(), 0);//angle / 3 + Math.PI/2);
			}

		}
	}
	hand.addCard = function(card){
		//do a sorting with the pairs
		var i = hand.findPairs[card.name];
		if(i === undefined){
			hand.pairs.push({
				name: card.name,
				cards: []
			});
			hand.findPairs[card.name] = hand.pairs.length - 1;
			i = hand.findPairs[card.name];
		}

		var sprite = {w: deckImage.width / 13, h: deckImage.height / 4},
			rot = 0,
			pos = new Vector(0, 0),
			posData = {r: 0, l: 0, w: window.innerWidth/2, h: window.innerHeight};
		var cDisp = new handCard(card, sprite, rot, pos, posData);
		
		hand.pairs[i].cards.push(cDisp);

		if(hand.pairs[i].cards.length == 4){
			playerScore++;
			hand.pairs.splice(i, 1);
			delete hand.findPairs[card.name];

			console.log('player got points for ' + card.name);
			hand.arange();
			hand.resetIndex();
		}

		hand.cardsize++;
		hand.arange();
	}
	hand.resetIndex = function(){
		for(var i = 0; i < hand.pairs.length; i++){
			hand.findPairs[hand.pairs[i].name] = i;
		}
	}
	hand.pickCard = function(mouseLine){
		// mouse collision and click handlement
		//then say ask ai if he has card

		for(var i = hand.pairs.length - 1; i >= 0; i--){
			var b = false;
			for(var j = 0; j < hand.pairs[i].cards.length; j++){
				if(hand.pairs[i].cards[j].circle.collision(mouseLine.v1)){
					if(hand.pairs[i].cards[j].polynom.collision(mouseLine)){

						var c = hand.pairs[i];
						hand.pairs.splice(i, 1);
						hand.pairs.push(c);
						hand.resetIndex();

						if(mouse.clicked && mouse.upClick){
							//this card select
							// console.log('ask for card');
							mouse.upClick = false;
							hand.recive(ai.getCard(c.name));
						}

						b = true;
						break;
					}
					else {
						hand.pairs[i].cards[j].polynom.color = '#000';
					}
				}
				else {
					hand.pairs[i].cards[j].polynom.color = '#000';
				}
			}
			if(b){
				break;
			}
		}
	}
	hand.recive = function(res){
		if(res == 'go fish'){
			console.log('requested bad card from ai');
			infoText = "Go Fish";
			infoTimer = 0;
			goFish = true;
		}
		else {
			console.log('recived cards from ai');
			infoText = "Recived " + res.length + " cards of " + res[0].name;
			infoTimer = 0;
			for(var i = 0; i < res.length; i++){
				console.log(res[i]);
				hand.addCard(res[i]);
			}
		}
	}
	hand.request = function(name){
		var index = hand.findPairs[name];
		if(index !== undefined){
			console.log(name);
			console.log(index);
			console.log(hand.pairs[index]);
			var pair = $.extend(true, {}, hand.pairs[index]);

			console.log(pair);
			hand.cardsize -= pair.cards.length;
			hand.pairs.splice(index, 1);
			delete hand.findPairs[name];
			return pair.cards;
		}
		else {
			console.log('go fish ai');
			return 'go fish';
		}
	}

	hand.render = function(ctx){
		for(var i = 0; i < hand.pairs.length; i++){
			// console.log(hand.pairs[i]);
			for(var j = 0; j < hand.pairs[i].cards.length; j++){
				hand.pairs[i].cards[j].render(ctx);
			}
		}
	}

	return hand;
}
