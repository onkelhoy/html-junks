/***************************************************************
		GAME VARIABLES
***************************************************************/
var c, ctx, w, h;

var Cards = [], ai, imgDone = 0;
var displayCards = [];
var deckImage = new Image();
var backImage = new Image();
var mouseLine;
var hand;

var turn = 0;
var started = false;
var added = false;
var addCount = 0;
var timer = 0;
var infoText = "", textTimer = 0;
var goFish = false, playerScore = 0, aiScore = 0;

backImage.onload = function(){
	imgDone++;
	if(imgDone == 2){
		init();
	}
}
backImage.src = 'back.png';
deckImage.onload = function(){
	imgDone++;
	if(imgDone == 2){
		init();
	}
}
deckImage.src = "deck.png";

/***************************************************************
		GAME INIT
***************************************************************/

function init(){
	c = document.getElementById("c");
	ctx = c.getContext("2d");
	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;

	load();
	gameLoop();
}


/***************************************************************
		GAME FUNCTIONS
***************************************************************/
function load(){
	for(var y = 0; y < 4; y++){
		for(var x = 0; x < 13; x++){
			Cards.push(new Card(x, y));
		}
	}

	for(var i = 0; i < 52; i++){
		var t = Cards[i];
		var randIndex = Math.round(Math.random() * 51);
		Cards[i] = Cards[randIndex];
		Cards[randIndex] = t;

	}
	fishCards = Cards;

	ai = new AI(0);
	// ai.startUp();

	spreadOut();
	hand = new Hand();
}

function spreadOut(){
	var sprite = {'x': 0, 'y': 0, 'w': backImage.width * 0.23, 'h': backImage.height * 0.23};
	for(var i = 0; i < Cards.length; i++){
		sprite.x = Cards[i].value.x;
		sprite.y = Cards[i].value.y;

		var angle = Math.PI * 2 * Math.random();
		var center = new Vector(Math.random() * (w * 0.9) + w * 0.05, Math.random() * (h * 0.6) + h * 0.1);
		var disp = new displayCard(angle, center, sprite, Cards[i]);
		displayCards.push(disp);
	}
}

function update(){
	mouseLine = new Line(new Vector(mouse.x, mouse.y), new Vector(mouse.x + 300, mouse.y - 200));

	if(turn == 0){
		if(!started || goFish){
			if(displayCards.length == 0){
				console.log('theres no more cards to pick');
				console.log('AIs turn');
				turn = 1;
			}
			for(var i = displayCards.length - 1; i >= 0; i--){// de sista renderas överst ju
				if(displayCards[i].circle.collision(mouseLine.v1)){
					if(displayCards[i].polynom.collision(mouseLine)){

						var c = displayCards[i];
						displayCards.splice(i, 1);
						displayCards.push(c);

						if(mouse.clicked && !added){
							added =  true;
							hand.addCard(displayCards[i].card);
							displayCards.splice(i, 1);

							goFish = false;
							addCount++;
							if(addCount == 7 && !started){ //ai's turn to pick.. then
								addCount = 0;
								console.log('AIs turn');
								turn = 1;
							}
							if(started){
								console.log('AIs turn');
								turn = 1;
							}
							break;
						}

						for(var j = 0; j < displayCards.length; j++){
							if(j != i){
								displayCards[j].polynom.color = '#000'; //deselect
							}
						}
						break;
					}
					else {
						displayCards[i].polynom.color = '#000'; //deselect
					}
				}
				else {
					displayCards[i].polynom.color = '#000'; //deselect
				}
			}
		}
		else {
			//annars så skall spelare välja de kort som han/hon vill ha
			hand.pickCard(mouseLine);
		}
	}
	else {
		// AIs turn
		if(!started){ // pick up 7 cards
			timer++;
			if(timer == 15){
				timer = 0;
				addCount++;
				ai.goFish();
				if(addCount == 7){
					started = true;
					turn = 0;
					console.log(ai.pairs);
					console.log('Players turn');
				}
			}
		}
		else { //normal play
			ai.pickCard();
		}
	}
}

function render(){
	ctx.clearRect(0, 0, w, h);

	// mouseLine.render(ctx);
	for(var i = 0; i < displayCards.length; i++){
		displayCards[i].render(ctx);

	}
	ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.font="30px Verdana";
		ctx.fillText('you: '+playerScore, 50, h - 50);
		ctx.fillText('ai: '+aiScore, w - 150, h - 50);
		if(playerScore + aiScore < 13 && textTimer < 10){
			textTimer++;
			ctx.font = "50px Verdana";
			ctx.fillText(infoText, w/2, h/2);
		}
	ctx.closePath();

	hand.render(ctx);
}

function gameLoop(){
	update();
	render();
	if(playerScore + aiScore < 13){
		requestAnimationFrame(gameLoop);
	}
	else {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.font="150px Verdana";
		// i dont think there can be a tie.. but but :I
		ctx.fillText((playerScore > aiScore) ? "You are the winner" : (aiScore > playerScore) ? "Ai is the winner" : "its a tie", w/2, h/2);
	}
}