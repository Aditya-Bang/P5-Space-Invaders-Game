// constants - page numbers
var GAME = 1;
var MAIN_MENU = 2;
var QUIT = 3;
var PAUSE = 4;
var SETTINGS = 5;
var INSTRUCTIONS = 6;
var GAME_OVER = 7;
var page = MAIN_MENU;
var lastPage = page;

// moving background
var backgroundY = 0; // y value
var starCoords = []; // star x and y values list
var yBuffer = 100; // height buffer

// button name vars
var xButton = {};
var MM_Buttons = ["PLAY", "SETTINGS", "QUIT"]; // main menu buttons
var Pause_Buttons = ["RESUME", "SETTINGS", "MENU"] // pause menu buttons
var Set_Buttons = ["EASY", "HARD", "SOUND:OFF"]; // settings menu buttons

// settings
var gameSound = false; // sound
var difficulty = "EASY"; // difficulty

// spaceship vars
var xShip; // spaceship x
var yShip; // spaceship y
var particles = []; // thruster particles list
var edge = 20; // border so spaceship is always inside frame
var lives; // amount of lives
var score; // score

// lists of moving sprites
var asteroids = []; // list of asteroids
var astSpeed; // asteroids speed
var shots = []; // list of shots
var colHP; // colors of astroid to correlate with hp
var spawnRates; // spawn rate timer

// sound
let shotFiring;
let explosion;
let bgMusic;

// loads sound
function preload() {
  soundFormats('mp3');
  
  // shot firing
  shotFiring = loadSound('shotFiring.mp3');
  shotFiring.setVolume(0.03); // set volume to low
  
  // explosion
  explosion = loadSound('explosion.mp3');
  explosion.duration(2);
  explosion.setVolume(0.2);
  
  // bgMusic
  bgMusic = loadSound('bgMusic.mp3');
  bgMusic.setVolume(0.1);
}

// difficult kicks changes initialize settings
function setup() {
  createCanvas(500, 600);
  rectMode(CORNERS);
  
  // text styles
  textAlign(CENTER, CENTER);
  textFont("Roboto");
  
  // random list of stars for background
  for (let i = 0; i < width; i += width/8) {
    for (let j = -yBuffer; j < height*7/8 + yBuffer; j += height/8) {
      starX = floor(random(i, i + width/8));
      starY = floor(random(j, j + height/8));
      append(starCoords, {x: starX, y: starY});
    }
  }
  
  // all buttons have same x dimensions
  xButton = {x1: width/6, x2: width*5/6};
  
  // color and hp initialization
  colHP = [color('#FF0000'), color('#FF8C00'), color('#FFFF00'), color('#7CFC00')];
  
  // initialize once when code is run
  initialize();
  
  setTimeout(newAstroid, spawnRates);
}
function movingBackground() {
  // draw constant moving background
  background(25,25,112);
  
  // draw random stars
  stroke(255);
  fill(255);
  for (let i = 0; i < starCoords.length; i++) {
    circle(starCoords[i].x, (backgroundY + starCoords[i].y) % (height + yBuffer) - yBuffer, 5);
  }
  
  // jupiter
  stroke(0);
  fill(255,140,0);
  circle(100, backgroundY % (height + 2*yBuffer) - yBuffer, 80);
  fill(255,99,71);
  ellipse(110, (backgroundY + 15) % (height + 2*yBuffer) - yBuffer, 20, 15);
  fill(218,165,32);
  arc(100, backgroundY % (height + 2*yBuffer) - yBuffer, 120, 20, 0, PI);
  arc(60, backgroundY % (height + 2*yBuffer) - yBuffer, 40, 10, PI, -PI/2.1);
  arc(140, backgroundY % (height + 2*yBuffer) - yBuffer, 40, 10, -PI/1.9, 0);
  
  // mars
  fill(205,92,92);
  circle(400, (backgroundY + 200) % (height + 2*yBuffer) - yBuffer, 50);
  
  // earth
  fill(135,206,235);
  circle(260, (backgroundY + 500) % (height + 2*yBuffer) - yBuffer, 60);
  
  // draws detail in earth
  stroke(0,206,209);
  strokeWeight(2);
  noFill();
  
  for (let arcHeight = 0; arcHeight < 5; arcHeight++) {
    arc(260, (backgroundY + 500) % (height + 2*yBuffer) - yBuffer, 58, arcHeight*15, 0, PI, OPEN);
    arc(260, (backgroundY + 500) % (height + 2*yBuffer) - yBuffer, 58, arcHeight*15, PI, 0, OPEN);
  }
  
  // reset settings
  stroke(0);
  strokeWeight(1);
  fill(255);
  
  // makes background objects move downwards
  backgroundY += 2;
}

function initialize() {
  
  // inital values
  xShip = width/2; // spaceship x
  yShip = height/2 + 100; // spaceship y
  score = 0; // score
  asteroids = []; // list of asteroids
  shots = []; // list of shots
  spawnRates = 2400; // 2.4 second initial spawn
  
  // easy difficulty
  if (difficulty == "EASY") {
    lives = 10; // amount of lives
    astSpeed = 2.1; // asteroids speed
  }
  // hard difficulty
  else {
    lives = 8; // amount of lives
    astSpeed = 1.6; // asteroids speed
  }
}

function playGame() {
  
  // if game is over once lives are gone
  if (lives <= 0) {
    page = GAME_OVER;
  }
  
  // spaceship
  // body
  fill(50);
  stroke(0);
  rect(xShip+2, yShip-62, xShip-2, yShip-72);
  
  fill(240);
  stroke(200);
  strokeWeight(3);
  
  rect(xShip-10, yShip, xShip+10, yShip-50);
  triangle(xShip-10, yShip-50, xShip+10, yShip-50, xShip, yShip-65);
  triangle(xShip-10, yShip-42, xShip-10, yShip-5, xShip-35, yShip-5);
  triangle(xShip+10, yShip-42, xShip+10, yShip-5, xShip+35, yShip-5);
  
  fill(200);
  rect(xShip-27, yShip-7, xShip-15, yShip-3);
  rect(xShip+27, yShip-7, xShip+15, yShip-3);
  
  // detail
  strokeWeight(1);
  fill(0,0,128);
  rect(xShip-3, yShip, xShip+3, yShip-50);
  
  fill(220,20,60);
  circle(xShip-18, yShip-20, 7);
  circle(xShip+18, yShip-20, 7);
  
  fill(64,224,208);
  arc(xShip, yShip-51, 10, 10, PI, 0);
  
  // particles for thrusters
  noStroke();
  
  // create particles
  particles.push({x:xShip-21, y:yShip, dia:random(4, 8), vx:random(-0.7, 0.7), fade:255});
  particles.push({x:xShip+21, y:yShip, dia:random(4, 8), vx:random(-0.7, 0.7), fade:255});
  
  // iterate over list of all particles
  for (let i = 0; i < particles.length; i++) {
    
    // show particles
    fill(random(200,230), random(50, 150), 10, particles[i].fade);
    circle(particles[i].x, particles[i].y, particles[i].dia);
    
    // change fade
    particles[i].fade -= 12;
    
    // remove particles if list greater than 10
    if (particles.length > 50) {
      particles.splice(0, 1);
    }
    
    // move particles
    particles[i].x += -particles[i].vx;
    particles[i].y += 3;
  }
  
  // shot and astroid collision
  // asteroids is i, shots is j
  for (let i = asteroids.length - 1; i >= 0; i--) {
    for (let j = shots.length - 1; j >= 0; j--) {
      if (asteroids[i].size*30 + 4 > dist(shots[j].x, shots[j].y, asteroids[i].x, asteroids[i].y)) {
        
        // reduce asteroids hp and remove shot
        asteroids[i].hp--;
        shots.splice(j, 1);
      }
    } 
  }
  
  // asteroids
  // iterate over all asteroids
  for (let i = asteroids.length - 1; i >= 0; i--) {
    
    // remove asteroids if hp is 0 and is successful destroyed
    if (asteroids[i].hp <= 0) {
      // increases objective points
      asteroids.splice(i, 1);
      score++;
      
      if (gameSound) {
        explosion.play();
      }
    }
    // remove asteroids if off screen
    else if (asteroids[i].y > height + yBuffer) {
      asteroids.splice(i, 1);
      lives--;
    }
    else {
      // display asteroids
      // body
      fill(80);
      stroke(70);
      strokeWeight(3);
      circle(asteroids[i].x, asteroids[i].y, asteroids[i].size*60);

      // craters
      fill(colHP[colHP.length - asteroids[i].hp]);
      stroke(40);

      ellipse(asteroids[i].x+asteroids[i].size*13, asteroids[i].y+asteroids[i].size*13, asteroids[i].size*12, asteroids[i].size*10)
      ellipse(asteroids[i].x+asteroids[i].size*-10,asteroids[i].y+asteroids[i].size*-10,asteroids[i].size*13, asteroids[i].size*11);
      ellipse(asteroids[i].x+asteroids[i].size*-13,asteroids[i].y+asteroids[i].size*10,asteroids[i].size*10,asteroids[i].size*12);

      fill(10);
      circle(asteroids[i].x+asteroids[i].size*-20, asteroids[i].y, asteroids[i].size*4);
      circle(asteroids[i].x+asteroids[i].size*5, asteroids[i].y+asteroids[i].size*-15, asteroids[i].size*3);
      circle(asteroids[i].x+asteroids[i].size*2, asteroids[i].y+asteroids[i].size*15, asteroids[i].size*4);
      circle(asteroids[i].x+asteroids[i].size*15, asteroids[i].y+asteroids[i].size*-2, asteroids[i].size*2);
      circle(asteroids[i].x+asteroids[i].size*2, asteroids[i].y+asteroids[i].size*-2, asteroids[i].size);

      // move asteroids
      asteroids[i].y += astSpeed;

      // collision detection with spaceship
      for (let j = 0; j <= 35; j += 7) {
        // collision points which are along the triangular edge of the ship
        if (asteroids[i].size*30 > dist(asteroids[i].x, asteroids[i].y, xShip - j, yShip - 70 + 2*j) || asteroids[i].size*30 > dist(asteroids[i].x, asteroids[i].y, xShip + j, yShip - 70 + 2*j)) {

          // remove asteroids and lose a life
          asteroids.splice(i, 1);
          lives -= 2;
          if (gameSound) {
            explosion.play();
          }
          break;
        }
      }
    }
  }
  
  // iterate through list of all shots
  for (let i = shots.length - 1; i >= 0; i--) {
    // display shots
    // shot trail
    noStroke();
    fill(152,251,152);
    triangle(shots[i].x-5, shots[i].y,shots[i].x+5, shots[i].y,shots[i].x, shots[i].y+15);

    // shot circle
    fill(34,139,34);
    circle(shots[i].x, shots[i].y, 10);
    stroke(1);
    
    // move shot
    shots[i].y -= 2;
    
    // remove shot
    if (shots[i].y < -yBuffer) {
      shots.splice(i, 1);
    }
  }
}

function newAstroid() {
  if (page == GAME) {
    
    // easy difficulty
    if (difficulty == "EASY") {
      // spawn a single asteroid
      asteroids.push({x: random(3*edge, width - 3*edge), y: -50, size: random(0.8, 1.4), hp: colHP.length - 1});
      
      // reduce spawn rates at 50 milliseconds until it is 600 ms
      // recalls function or self faster
      if (spawnRates >= 600) {
        spawnRates -= 50;
      }
    }
    
    // hard difficulty
    else {
      // spawn 2 asteroids for hard difficulty, random separation
      let astX = random(3*edge, width - 3*edge);
      asteroids.push({x: astX, y: -50, size: random(0.8, 1.4), hp: colHP.length});
      asteroids.push({x: (astX + random(80, 250)) % (width - 3*edge) + 2*edge, y: -50, size: random(0.8, 1.4), hp: colHP.length});
      
      // reduce spawn rates at 40 milliseconds until it is 1200 ms
      // recall function faster
      if (spawnRates >= 1200) {
        spawnRates -= 40;
      }
    }
    
    // gradually increase asteroid speed
    astSpeed *= 1.03;
  }
  
  // call function again to create an endless loop
  setTimeout(newAstroid, spawnRates);
}

function draw() {
  // text settings
  textSize(60);
  textStyle(BOLD);
  strokeWeight(1);
  
  // draw constant moving background
  movingBackground();
  
  if (page == MAIN_MENU) {
    
    initialize(); // reset game
    
    // displays main menu buttons
    for (let i = 0; i < MM_Buttons.length; i++) {

      // checks if mouse is hovering over button
      if ((mouseX >= xButton.x1 && mouseX <= xButton.x2) && (mouseY >= height*(3 * i + 2)/12 && mouseY <= height*(3 * i + 4)/12)) {
        stroke(124,252,0);
        fill(40);
        rect(xButton.x1, height*(3 * i + 2)/12, xButton.x2, height*(3 * i + 4)/12);
        fill(124,252,0);
        text(MM_Buttons[i], width/2, height*(i+1)/4);
      }
      // if mouse is not hovering
      else {
        stroke(0,206,209);
        fill(0);
        rect(xButton.x1, height*(3 * i + 2)/12, xButton.x2, height*(3 * i + 4)/12);
        fill(0,206,209);
        text(MM_Buttons[i], width/2, height*(i+1)/4);
      }
    }
    
    // instructions menu
    // check if hovering
    if (dist(mouseX, mouseY, 25, 25) <= 20) {
      stroke(220);
      fill(40);
      circle(25,25,40);
      fill(220);
      textSize(32);
      text("?",25,26);
    }
    else {
      stroke(255);
      fill(0);
      circle(25,25,40);
      fill(255);
      textSize(32);
      text("?",25,26);
    }
  }
  
  // pause screen
  else if (page == PAUSE) {
    // displays pause menu buttons
    for (let i = 0; i < Pause_Buttons.length; i++) {

      // checks if mouse is hovering over button
      if ((mouseX >= xButton.x1 && mouseX <= xButton.x2) && (mouseY >= height*(3 * i + 2)/12 && mouseY <= height*(3 * i + 4)/12)) {
        stroke(124,252,0);
        fill(40);
        rect(xButton.x1, height*(3 * i + 2)/12, xButton.x2, height*(3 * i + 4)/12);
        fill(124,252,0);
        text(Pause_Buttons[i], width/2, height*(i+1)/4);
      }
      // if mouse is not hovering
      else {
        stroke(0,206,209);
        fill(0);
        rect(xButton.x1, height*(3 * i + 2)/12, xButton.x2, height*(3 * i + 4)/12);
        fill(0,206,209);
        text(Pause_Buttons[i], width/2, height*(i+1)/4);
      }
    }
  }
  
  // instructions screen
  else if (page == INSTRUCTIONS) {
    
    // black box for instructions to be written on
    fill(0);
    stroke(255);
    strokeWeight(4);
    rect(xButton.x1, height*1/12, xButton.x2, height*11/12);
    
    // text stylings for instruction
    fill(255);
    textStyle(NORMAL);
    textSize(20);
    strokeWeight(1);
    
    // instructions
    text("Welcome to Space Invaders!!\n\nThe objective is to destroy as many\nasteroids as possible.\nUse WASD to move and SPACE\n to shoot asteroids. You lose a\nlife for each asteroid that gets past the\nship and two lives for each asteroid that\nhits the ship.\nChanging difficulty alters asteroid spawn\nrates, speed, hitpoints and lives count.\n\nGood luck and have fun!", width/2, height*11/24);
    
    // back button
    strokeWeight(2);
    
    // if mouse is hovering
    if ((mouseX >= width*1/3 && mouseX <= width*2/3) && (mouseY >= height*10/12 && mouseY <= height*11/12)) {
      fill(40);
      stroke(220);
      rect(width*1/3,height*10/12,width*2/3,height*11/12);
      strokeWeight(1);
      fill(220);
      text("BACK", width/2, height*21/24);
    }
    else {
      fill(0);
      stroke(255);
      rect(width*1/3,height*10/12,width*2/3,height*11/12);
      strokeWeight(1);
      fill(255);
      text("BACK", width/2, height*21/24);
    }
  }
  
  // settings screen
  else if (page == SETTINGS) {
    for (let i = 0; i < Set_Buttons.length; i++) {
      
      // let users know current difficulty by drawing red outline
      noFill();
      stroke(255,0,0);
      strokeWeight(5);
      if (difficulty == "EASY") {
        rect(xButton.x1-10, height*2/12-10, xButton.x2+10, height*4/12+10);
      }
      else {
        rect(xButton.x1-10, height*5/12-10, xButton.x2+10, height*7/12+10);
      }
      // reset stroke weight
      strokeWeight(1);

      // checks if mouse is hovering over button
      if ((mouseX >= xButton.x1 && mouseX <= xButton.x2) && (mouseY >= height*(3 * i + 2)/12 && mouseY <= height*(3 * i + 4)/12)) {
        stroke(124,252,0);
        fill(40);
        rect(xButton.x1, height*(3 * i + 2)/12, xButton.x2, height*(3 * i + 4)/12);
        fill(124,252,0);
        text(Set_Buttons[i], width/2, height*(i+1)/4);
      }
      // if mouse is not hovering
      else {
        stroke(0,206,209);
        fill(0);
        rect(xButton.x1, height*(3 * i + 2)/12, xButton.x2, height*(3 * i + 4)/12);
        fill(0,206,209);
        text(Set_Buttons[i], width/2, height*(i+1)/4);
      }
    }
    
    // back button
    // checks if hovering
    if (dist(mouseX, mouseY, 25, 25) <= 20) {
      stroke(220);
      fill(40);
      circle(25,25,40);
      fill(220);
      textSize(32);
      text("<-",25,26);
    }
    else {
      stroke(255);
      fill(0);
      circle(25,25,40);
      fill(255);
      textSize(32);
      text("<-",25,26);
    }
  }
  
  else if (page == GAME) {
    
    // starts game
    playGame();
    
    // move shapeship
    // left
    if (keyIsDown(65) && xShip - 35 >= edge) {
      xShip -= 3;
    }
    // right
    if (keyIsDown(68) && xShip + 35 <= width - edge) {
      xShip += 3;
    }
    // up
    if (keyIsDown(87) && yShip - 65 >= edge) {
      yShip -= 3;
    }
    // down
    if (keyIsDown(83) && yShip + 30 <= height - edge) {
      yShip += 3;
    }
    
    // Pause button
    // checks if hovering
    if (dist(mouseX, mouseY, 25, 25) <= 20) {
      stroke(220);
      fill(40);
      circle(25,25,40);
      fill(220);
      textSize(32);
      text("||",25,26);
    }
    else {
      stroke(255);
      fill(0);
      circle(25,25,40);
      fill(255);
      textSize(32);
      text("||",25,26);
    }
    
    // lives and score counter
    noStroke();
    fill(255,0,0);
    text("Lives: " + lives, width - 70, 27);
    fill(0,206,209);
    text("Score: " + score, 120, 27);
    stroke(1);
  }
  
  // game over screen
  else if (page == GAME_OVER) {
    // black box for clarity
    fill(0);
    stroke(255);
    strokeWeight(4);
    rect(xButton.x1, height*1/12, xButton.x2, height*11/12);
    
    // text stylings for message
    fill(255);
    textStyle(NORMAL);
    textSize(20);
    strokeWeight(1);
    text("GAME OVER\nYou had a score of " + score + " points!", width/2, height*11/24);
    
    // back button
    strokeWeight(2);
    
    // if mouse is hovering
    if ((mouseX >= width*1/3 && mouseX <= width*2/3) && (mouseY >= height*10/12 && mouseY <= height*11/12)) {
      fill(40);
      stroke(220);
      rect(width*1/3,height*10/12,width*2/3,height*11/12);
      strokeWeight(1);
      fill(220);
      text("BACK", width/2, height*21/24);
    }
    else {
      fill(0);
      stroke(255);
      rect(width*1/3,height*10/12,width*2/3,height*11/12);
      strokeWeight(1);
      fill(255);
      text("BACK", width/2, height*21/24);
    }
  }
  
  // quit screen
  else if (page == QUIT) {
    // black box for clear background
    fill(0);
    stroke(255);
    strokeWeight(4);
    rect(width/20, height*4/12, width*19/20, height*8/12);
    
    // text stylings for message
    fill(255);
    textStyle(NORMAL);
    textSize(100);
    strokeWeight(1);
    text("Goodbye!!", width/2, height/2);
    
    // stop background music
    bgMusic.stop();
    
    // stop program
    noLoop();
  }
}

function mouseClicked() {
  // menu clicks
  if (mouseButton == LEFT) {
    
    // Main Menu
    if (page == MAIN_MENU) {
      
      // games screen correlating with buttons - ordered
      let gameScreen = [GAME, SETTINGS, QUIT];
      
      // iterates through list of buttons
      for (let i = 0; i < MM_Buttons.length; i++) {

        // checks if mouse is clicked over button coords
        if ((mouseX >= xButton.x1 && mouseX <= xButton.x2) && (mouseY >= height*(3 * i + 2)/12 && mouseY <= height*(3 * i + 4)/12)) {
          
          // changes game page
          lastPage = page;
          page = gameScreen[i];
        }
      }
      
      // instruction menu, clicked
      if (dist(mouseX, mouseY, 25, 25) <= 20) {
        page = INSTRUCTIONS;
      }
    }
    
    // Pause Menu
    else if (page == PAUSE) {
      
      // games screen correlating with buttons - ordered
      let gameScreen = [GAME, SETTINGS, MAIN_MENU];
      
      // iterates through list of buttons
      for (let i = 0; i < Pause_Buttons.length; i++) {

        // checks if mouse is clicked over button coords
        if ((mouseX >= xButton.x1 && mouseX <= xButton.x2) && (mouseY >= height*(3 * i + 2)/12 && mouseY <= height*(3 * i + 4)/12)) {
          
          // changes game page
          lastPage = page;
          page = gameScreen[i];
        }
      }
    }
    
    // instructions page
    else if (page == INSTRUCTIONS) {
      // check if button is clicked
      if ((mouseX >= width*1/3 && mouseX <= width*2/3) && (mouseY >= height*10/12 && mouseY <= height*11/12)) {
        
        // go back to main menu
        page = MAIN_MENU;
      }
    }
    
    // settings page
    else if (page == SETTINGS) {
      
      // difficultly options
      let difOptions = ["EASY", "HARD"];
      
      // iterates through list of buttons
      for (let i = 0; i < Set_Buttons.length; i++) {

        // checks if mouse is clicked over button coords
        if ((mouseX >= xButton.x1 && mouseX <= xButton.x2) && (mouseY >= height*(3 * i + 2)/12 && mouseY <= height*(3 * i + 4)/12)) {
          // if sound button is toggled
          // additional code, since I didn't label the button with an explicit name
          let matchVar = match(Set_Buttons[i],"SOUND");
          if (matchVar == "SOUND") {
            if (gameSound) {
              // toggle game sound
              gameSound = (!gameSound)
              // changes the interface to correlate with change in settings
              Set_Buttons.splice(Set_Buttons.length - 1, 1);
              Set_Buttons.push("SOUND:OFF");
              
              // stop background music
              bgMusic.stop();
            }
            else {
              // toggle game sound
              gameSound = (!gameSound)
              // changes the interface to correlate with change in settings
              Set_Buttons.splice(Set_Buttons.length - 1, 1);
              Set_Buttons.push("SOUND:ON");
              
              // loop background music
              bgMusic.loop();
            }
          }
          else {
            // change difficulty to option
            difficulty = difOptions[i];
            initialize();
          }
        }
      }
      
      // back button
      // if clicked
      if (dist(mouseX, mouseY, 25, 25) <= 20) {
        // goes back to last page user was on, either, pause or main menu
        page = lastPage;
      }
    }
    
    // game screen
    else if (page == GAME) {
      if (dist(mouseX, mouseY, 25, 25) <= 20) {
        // goes back to last page user was on, either, pause or main menu
        page = PAUSE;
      }
    }
    
    // game over screen
    else if (page == GAME_OVER) {
      // check if button is clicked
      if ((mouseX >= width*1/3 && mouseX <= width*2/3) && (mouseY >= height*10/12 && mouseY <= height*11/12)) {
        
        // go back to main menu
        page = MAIN_MENU;
      }
    }
  }
}

function keyPressed() {
  // if playing the game
  if (page == GAME) {
    // if shot is fired from spaceship
    if (keyCode == 32) {
      
      // create new shot
      shots.push({x: xShip, y: yShip - 72});
      
      // play shotFiring sound
      if (gameSound) {
        shotFiring.play();
      }
    }
  }
}