// set up the canvas
var canvas;
var canvasContext;

// ball variables
var ballX;
var ballY;
var ballRadius = 8;
var ballVelocityX = 9;
var ballVelocityY = 3;

// pad vars and consts
var padLeftY = 250;
var padRightY = 250;
const padHeight = 100;
const padWidth = 10;
var padRightVelocity = 3;
var padOffset = 10;

// score vars and consts
var playerScore = 0;
var cpuScore = 0;
const winScore = 5;

// winscreen related vars
var showingWinScreen = false;
var playerWin = false;
var cpuWin = false;

// difficulty stuff
var askForDiffScreen = true;
var chosenDiff = 0;

// wait or not
var diffChanged = false;

$(document).ready(() => {
    canvas = document.getElementById("game");
    canvasContext = canvas.getContext('2d');

    // make sure the selection has default value
    $('select[name=diffSelect]').val(0);

    // run game at interval
    setInterval(() => {
        calcMovement();
        drawElements();
    }, 1000/30);

    // ball to the middle
    ballX = canvas.width/2-(ballRadius);
    ballY = canvas.height/2-(ballRadius);

    // click event
    canvas.addEventListener('mousedown', handleMClick);
    $('#textbox').on('click', handleMClick);

    // event to make the left pad follow mouse
    canvas.addEventListener('mousemove', (evt) => {
        var mousePos = calcMousePos(evt);
        padLeftY = mousePos.y - padHeight / 2;
    });
});

function handleMClick() {
    // reset screen on mouse click
    if (showingWinScreen || diffChanged) {
        padRightVelocity = 4 * chosenDiff;
        resetBall();
        playerScore = 0;
        cpuScore = 0;
        ballVelocityY = 3;
        showingWinScreen = false;
        diffChanged = false;
    }
}

function diffSelection(sel) {
    // set difficulty value on change, function runs from HTML
    chosenDiff = parseInt(sel.value, 10);
    askForDiffScreen = false;
    diffChanged = true;
}

function cpuMove() {
    // follow the ball
    if (ballY - 35 > padRightY + padHeight / 2)
        padRightY += padRightVelocity;
    else if (ballY + 35 < padRightY + padHeight / 2)
        padRightY -= padRightVelocity;
}

function leftPadCollisionCheck() {
    if (ballY + ballRadius >= padLeftY && ballY - ballRadius <= padLeftY + padHeight) {
        if (ballX + ballRadius >= padOffset && ballX - ballRadius <= padOffset + padWidth) {
            ballVelocityX *= -1;
            var deltaY = ballY - (padLeftY + padHeight / 2);
            ballVelocityY = deltaY * 0.4;
            return true;
        } else return false;
    } else return false;
}

function rightPadCollisionCheck() {
    if (ballY + ballRadius >= padRightY && ballY - ballRadius <= padRightY + padHeight) {
        if (ballX + ballRadius >= canvas.width - padOffset - padWidth && ballX - ballRadius <= canvas.width - padOffset) {
            ballVelocityX *= -1;
            var deltaY = ballY - (padRightY + padHeight / 2);
            ballVelocityY = deltaY * 0.4;
            return true;
        } else return false;
    } else return false;
}

function calcMovement() {
    // no need to move when winscreen or diff asking screen is on
    if (showingWinScreen) return;
    if (askForDiffScreen) return;
    if (diffChanged) return;

    // let the right side do it's thing
    cpuMove();

    // move ball
    ballX += ballVelocityX;
    ballY += ballVelocityY;

    // collision check
    if (!leftPadCollisionCheck() && !rightPadCollisionCheck()) {
        if (ballX < 0) {
            cpuScore++;
            resetBall();
        } else if (ballX > canvas.width) {
            playerScore++;
            resetBall();
        }
    }

    // ceiling and floor collision and bounce check
    if (ballY <= 0 + ballRadius || ballY >= canvas.height - ballRadius)
        ballVelocityY *= -1;
}

function resetBall() {
    // reset scores on win
    if (playerScore >= winScore || cpuScore >= winScore) {
        // tell the thing who won and reset vars just in case
        if (playerScore >= winScore) playerWin = true; else playerWin = false;
        if (cpuScore >= winScore) cpuWin = true; else cpuWin = false;

        // show winscreen
        showingWinScreen = true;
    }

    // reset ball to middle if not yet won
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;

    // flip ball direction on reset
    ballVelocityX *= -1;
    ballVelocityY *= -1;
}

function calcMousePos(evt) {
    // get mouse x and y position on screen in relation to the canvas
    var rect = canvas.getBoundingClientRect();
    var doc = document.documentElement;
    var mouseX = evt.clientX - rect.left - doc.scrollLeft;
    var mouseY = evt.clientY - rect.top - doc.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}

function drawElements() {
    // scores
    $('#playerScore').text('Player: ' + playerScore);
    $('#cpuScore').text('CPU: ' + cpuScore);

    // background
    colorRect(0, 0, canvas.width, canvas.height, '#000000');

    // only draw background and winscreen when winscreen is on
    if (showingWinScreen) {
        displayText(cpuWin ? 'CPU won, click to restart' : playerWin ? 'You won, click to restart' : 'Something errored, apparently neither one won, click to restart')
        return;
    }

    // same as winscreen but with asking for diff selection
    if (askForDiffScreen) {
        displayText('Please select a difficulty from the dropdown');
        return;
    }

    // draw a click prompt if diff changes
    if (diffChanged) {
       displayText('Difficulty set, please click to start');
        return;
    }

    // hide textbox if it's not needed
    hideTextbox();

    // give me my net
    drawNet();

    // left pad
    colorRect(padOffset, padLeftY, padWidth, padHeight, '#ffffff');

    // right pad
    colorRect(canvas.width - padWidth - padOffset, padRightY, padWidth, padHeight, '#ffffff');

    // ball
    colorBall(ballX, ballY, ballRadius, '#ffffff');
}

function drawNet() {
    // draws a net
    for (var i = 10; i < canvas.height; i+=40) {
        colorRect(canvas.width / 2 - 1, i, 2, 20, '#ffffff')
    }
}

function colorBall(xpos, ypos, rad, color) {
    // makes a colored ball
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(xpos, ypos, rad, 0, Math.PI*2, true);
    canvasContext.fill();
}

function colorRect(xpos, ypos, w, h, color) {
    // makes a colored rectangle
    canvasContext.fillStyle = color;
    canvasContext.fillRect(xpos, ypos, w, h);
}

function displayText(text) {
    if ($('#textbox').hasClass('hide'))
        $('#textbox').toggleClass('hide');
    $('#textbox').text(text);
}

function hideTextbox() {
    if (!($('#textbox').hasClass('hide')))
        $('#textbox').toggleClass('hide');
    $('#textbox').text('');
}