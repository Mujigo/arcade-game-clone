/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

 var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */
     var doc = global.document,
     win = global.window,
     canvas = doc.createElement('canvas'),
     ctx = canvas.getContext('2d'),
     lastTime;

     canvas.width = 900;
     canvas.height = 800;
     doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
     function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
         var now = Date.now(),
         dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
         update(dt);
         render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
         lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
         win.requestAnimationFrame(main);
     }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
     function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
     function update(dt) {
        updateEntities(dt);
        checkFrogSave();
        checkCollisions();
    }

    function checkCollisions() {
        let playerLost = false;

        allEnemies.forEach(function (enemy) {

            // If the car tires are on the player then we smush the player!
            // This is for the back tires on a car traveling right
            // Or the front tires of a car traveling left
            if(player.x < enemy.x + 36 && player.y < enemy.y + 95)
                if(player.x + 55 > enemy.x + 57  && player.y + 75 > enemy.y + 4)
                    playerLost = true;

            // Front tires of a car traveling right
            // Back tires of a car going left
            if(player.x < enemy.x + 142 && player.y < enemy.y + 95)
                if(player.x + 55 > enemy.x + 163  && player.y + 75 > enemy.y + 4)
                    playerLost = true;
            });

        // If the player lost then check if they beat the hight score.
        if(playerLost) {
            // We don't want to run this is the player is smashed becaues the setTimeout functions will get
            // called multiple times.
            if(!player.isSmashed()) {

                // If the player beat the high score then we update the high score
                // and let the scoreboard know what to show the player.
                // We also play the frog sounds and pause the game music.
                if(scoreBoard.savedFrogs > scoreBoard.mostFrogsSaved) {
                    scoreBoard.mostFrogsSaved = scoreBoard.savedFrogs;
                    localStorage.setItem('mostFrogsSaved', scoreBoard.mostFrogsSaved);
                    scoreBoard.yourTheBest = true;
                    document.getElementById('gamemusic').pause();
                    document.getElementById('winsound').play();
                }
                // This lets the scoreboard know to tell the player the didn't beat the hight score.
                else {
                    scoreBoard.yourNotTheBest = true;
                }


                // This tells the scoreboard not to render any messages and sreusmes the game music.
                setTimeout(function () {
                    scoreBoard.yourTheBest = false;
                    scoreBoard.yourNotTheBest = false;
                    document.getElementById('gamemusic').play();
                },10000);

                // The squish sound is played
                document.getElementById('squishsound').play();
                // Set the player as smashed.
                player.smash();
                // Here we reset the speed for all the enemies.
                allEnemies.forEach(function (enemy) {
                    enemy.resetSpeed();
                });

                // We reset the player and the scoreboard score since the player was smashed.
                setTimeout(function () {
                    scoreBoard.reset();
                    player.reset();
                },10000);
            }
        }

    }

    // If the player makes it to the water then we play the splash sound and give them a point.
    // The enemy speed is also increased and the player gets reset to the bottom of the screen.
    function checkFrogSave() {
        if(player.y < 100) {
            document.getElementById('splashsound').play();
            scoreBoard.savedFrogs++;
            allEnemies.forEach(function (enemy) {
                enemy.updateSpeed(10);
            });
            player.reset();
        }
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
     function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();

    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
     function render() {

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Draw the background
        ctx.drawImage(Resources.get('images/Background.png'), 0, 0);

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
     function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
         player.render();

         allEnemies.forEach(function(enemy) {
            enemy.render();
        });
         scoreBoard.render();
     }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
     function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
     Resources.load([
        'images/frog-sitting.png',
        'images/frog-hoping.png',
        'images/Background.png',
        'images/smashed.png',
        'images/RedCar.png',
        'images/PurpleCar.png',
        'images/OrangeCar.png',
        'images/RedCar-L.png',
        'images/PurpleCar-L.png',
        'images/OrangeCar-L.png'
        ]);
     Resources.onReady(init);


    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
     global.ctx = ctx;
 })(this);
