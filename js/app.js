// Enemies our player must avoid
var Enemy = function(row,direction) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // Set the direction
    this.direction = direction;
    // Start off screen
    this.x = -100;
    // We place the car based on the row
    this.y = (row * 140) + 140;
    // Set the inital top speed
    this.topSpeed = 75;
    // Set the inital lowest speed
    this.baseSpeed = 50;
    // Pick a random speed for the inital go
    this.speed = Math.floor(Math.random() * this.topSpeed) + this.baseSpeed;

    // Pick a random car color.
    this.spriteSelector = Math.floor(Math.random() * 3);

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprites = ['images/RedCar.png','images/PurpleCar.png','images/OrangeCar.png',
    'images/RedCar-L.png','images/PurpleCar-L.png','images/OrangeCar-L.png'];
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
//
// We check the direction of the car before movin it. If the car is offscreen we reset it's position.
// We add 3 to this.spriteSelector if the are is going left to pick a random color car that is facing left.
Enemy.prototype.update = function(dt) {


    if(this.direction == 'left') {
        if(this.x<-100) {
            this.x=1000;
            this.speed = Math.floor(Math.random() * this.topSpeed) + this.baseSpeed;
            this.spriteSelector = Math.floor(Math.random() * 3) + 3;
        }
        this.x-=this.speed*dt;
    }
    else {
        if(this.x>900) {
            this.x=-100;
            this.speed = Math.floor(Math.random() * this.topSpeed) + this.baseSpeed;
            this.spriteSelector = Math.floor(Math.random() * 3);
        }
        this.x+=this.speed*dt;
    }


    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.shadowColor = "transparent";
    ctx.drawImage(Resources.get(this.sprites[this.spriteSelector]), this.x, this.y);
};

// Each time a player saves a frog we want to make the card move faster.
Enemy.prototype.updateSpeed = function (addToSpeed) {

    this.baseSpeed += addToSpeed;
    this.topSpeed += addToSpeed
};

// If the player gets smushed we need to reset the speed of the cards.
Enemy.prototype.resetSpeed = function () {
    this.topSpeed = 150;
    this.baseSpeed = 50;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
const Player = function() {
    // We want the player to start out around the botton of the screen and in the middle.
    this.x = 450;
    this.y = 725;

    // We use this variable to track the time of movement for the player. So we can animate the hopping.
    this.moveStart = 0;

    // We use this to change the players spirte.
    this.spriteSelector = 0;

    // Is the player dead?
    this.smashed = false;

    // The players sprites.
    this.sprites = ['images/frog-sitting.png','images/frog-hoping.png','images/smashed.png'];

    // A list of directions that the player is traveling.
    this.directions = {
        up : false,
        down : false,
        left : false,
        right : false
    }

    // Is the player moving
    this.moving = false;
};


// If the player is smashed there isn't much to do. We just need to update the sprite.
// If the player is alive we need to check if they are moving and in what direction so we can move the players position.
// If the player is holding down a key to move then we need to animate the player sprite. If the player isn't moving we make sure
// the player sprite is of the frog sitting. And last we check to make sure this.spriteSelector isn't out side of the array of sprites.
Player.prototype.update = function () {

    if(this.smashed) {
        this.spriteSelector = 2;
    }
    else {
        this.moving = false;
        for(d in this.directions) {
            if(this.directions[d]) {
                this.moving = true;
            }
        }

        if(this.directions.up)
            this.y-=2;
        if(this.directions.down && this.y <= 726)
            this.y+=2;
        if(this.directions.left && this.x >= 0)
            this.x-=2;
        if(this.directions.right && this.x <= 845)
            this.x+=2;

        if((Date.now() - this.moveStart) > 100 && this.moving) {
            this.moveStart = Date.now();
            this.spriteSelector++;
        }

        if(!this.moving)
            this.spriteSelector = 0;

        if(this.spriteSelector >= 2)
            this.spriteSelector = 0;
    }

};


// If the player is smashed we need to render the sprite a little to the left since it's not the same size as the other sprites.
// If the player is alive we can render normally.
Player.prototype.render = function () {
    ctx.shadowColor = "transparent";
    if(this.smashed)
        ctx.drawImage(Resources.get(this.sprites[this.spriteSelector]), this.x-25, this.y);
    else
        ctx.drawImage(Resources.get(this.sprites[this.spriteSelector]), this.x, this.y);
};


// The keyboard event handler sents us a button state and a direction. We update the directions object with that information.
Player.prototype.handleInput = function (state, direction) {
    if(state == 'up') {
        this.directions[direction] = false;
    }
    else {
        this.directions[direction] = true;
    }
};

// If the player gets smashed we call this function to make sure the player object knows.
Player.prototype.smash = function () {
    this.smashed = true;
};

// Returns this.smashed
Player.prototype.isSmashed = function () {
    return this.smashed;
};


// We use this to reset the player back after a smash or a saved frog.
Player.prototype.reset = function () {
    this.smashed = false;
    this.y = 725;
    this.x = 450;
};


// This is the scoreboard class. It shows the frogs that are saved and the best saves ever amount.
const ScoreBoard = function() {
    this.savedFrogs = 0;
    this.mostFrogsSaved = (localStorage.getItem('mostFrogsSaved') == null ? 0 : localStorage.getItem('mostFrogsSaved'));
    this.yourTheBest = false;
    this.yourNotTheBest = false;
    this.inGame = false;
};

// This renders the scoardboard.
ScoreBoard.prototype.render = function () {

    // Sets the text shadow details
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 4;


    // If we are in a game then show the score Otherwise show the game instruction screen.
    if(this.inGame) {
        ctx.shadowColor = "#000000"
        ctx.font = "30px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(`Frogs Saved: ${this.savedFrogs}`, 450, 35);
        ctx.fillText(`Most Frogs Saved: ${this.mostFrogsSaved}`, 450, 80);

        if(document.getElementById('winsound').paused)
            document.getElementById('gamemusic').play();
    }
    else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 900, 800);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "40px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(`Save The Frogs!`, 450, 350);

        ctx.font = "20px Roboto";
        ctx.textAlign = "center";
        ctx.fillText(`Use the arrow keys to move your frog. Try to save as many as you can!`, 450, 400);
        ctx.fillText(`If you get smashed the game starts over.`, 450, 425);


        ctx.fillText(`Press any key to play!`, 450, 500);
    }

    // If the player gets smashed and they beat the hight score then let them know.
    if(this.yourTheBest) {
        ctx.shadowColor = "#000000"
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "30px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(`You've saved the most! Your a true friend to frogs!`, 450, 300);
        ctx.fillText(`Keep saving those frogs!`, 450, 350);
    }

    // If they got smashed and didn't beat the hight score then let them know.
    if(this.yourNotTheBest) {
        ctx.shadowColor = "#000000"
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "30px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(`Keep trying, there are more frogs to save!`, 450, 340);
    }

};

// If the player gets smashed we reset the saved frogs count.
ScoreBoard.prototype.reset = function () {
    this.savedFrogs = 0;
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let allEnemies = [];
allEnemies.push(new Enemy(0,'left'));
allEnemies.push(new Enemy(1,'left'));
allEnemies.push(new Enemy(2,'right'));
allEnemies.push(new Enemy(3,'right'));


// Create a player
let player = new Player();

// Create the scoreboard
let scoreBoard = new ScoreBoard();


// We are listening to keyup and keydown events in the next two functions.
// This helps keep the movment smoth and lets us move in multiple directions.
// Holding down a key keeps the frog moving.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    // We don't do anything if we don't see a allowed key
    if(typeof(allowedKeys[e.keyCode]) != 'undefined')
        player.handleInput('up',allowedKeys[e.keyCode]);
});

document.addEventListener('keydown', function(e) {

    scoreBoard.inGame = true;

    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // We don't do anything if we don't see a allowed key
    if(typeof(allowedKeys[e.keyCode]) != 'undefined')
        player.handleInput('down',allowedKeys[e.keyCode]);

});
