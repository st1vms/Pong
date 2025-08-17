const gameCanvas = document.querySelector("#game-canvas");
const context = gameCanvas.getContext("2d");

const canvasWidth = gameCanvas.width;
const canvasHeight = gameCanvas.height;

const canvasColor = "#0d1117";

const winningScore = 100;

// Common player properties
const paddleWidth = 10;
const paddleHeight = 75;
const paddleSpeed = 5;

const paddleColor = "white";

// Ball properties
const ballColor = "white";
const ballRadius = 7.5;

// Starting speed
const startingSpeed = 1;
let ballSpeed = startingSpeed;
let ballSpeedIncrease = 0.5;
const maxBallSpeed = 5;

// Ball starts centered
let ballX = canvasWidth / 2;
let ballY = canvasHeight / 2;

// 1 or -1
let ballXDirection = 0;
let ballYDirection = 0;

// Horizontal margin from the wall
const paddleWallMargin = 5;

// Player One properties
let playerOneScore = 0;
let playerOnePaddle = {
	width: paddleWidth,
	height: paddleHeight,
	x: paddleWallMargin, // Player one is on the left
	y: (canvasHeight - paddleHeight) / 2, // Paddle starts centered
};

// Player Two properties
let playerTwoScore = 0;
let playerTwoPaddle = {
	width: paddleWidth,
	height: paddleHeight,
	x: canvasWidth - paddleWidth - paddleWallMargin, // Player two is on the right
	y: (canvasHeight - paddleHeight) / 2, // Paddle starts centered
};

// W-S
const playerOneUpKeyCode = "KeyW";
const playerOneDownKeyCode = "KeyS";

// Up-Down keys
const playerTwoUpKeyCode = "ArrowUp";
const playerTwoDownKeyCode = "ArrowDown";

let playerOneMovingUp = false;
let playerOneMovingDown = false;

let playerTwoMovingUp = false;
let playerTwoMovingDown = false;

// Used for ticks
const tickRateMs = 10;
let intervalID;

function onKeyPressed(
	keyCode,
	player_one_active = true,
	player_two_active = true
) {
	switch (keyCode) {
		case playerOneUpKeyCode: {
			if (player_one_active) {
				playerOneMovingUp = true;
			}
			break;
		}
		case playerOneDownKeyCode: {
			if (player_one_active) {
				playerOneMovingDown = true;
			}
			break;
		}
		case playerTwoUpKeyCode: {
			if (player_two_active) {
				playerTwoMovingUp = true;
			}
			break;
		}
		case playerTwoDownKeyCode: {
			if (player_two_active) {
				playerTwoMovingDown = true;
			}
			break;
		}
	}
}

function onKeyReleased(
	keyCode,
	player_one_active = true,
	player_two_active = true
) {
	switch (keyCode) {
		case playerOneUpKeyCode: {
			if (player_one_active) {
				playerOneMovingUp = false;
			}
			break;
		}
		case playerOneDownKeyCode: {
			if (player_one_active) {
				playerOneMovingDown = false;
			}
			break;
		}
		case playerTwoUpKeyCode: {
			if (player_two_active) {
				playerTwoMovingUp = false;
			}
			break;
		}
		case playerTwoDownKeyCode: {
			if (player_two_active) {
				playerTwoMovingDown = false;
			}
			break;
		}
	}
}

function checkCollision() {
	// Upper and lower wall collisions
	if (ballY <= ballRadius) {
		ballYDirection *= -1;
	}

	if (ballY >= canvasHeight - ballRadius) {
		ballYDirection *= -1;
	}

	// Side wall collisions
	if (ballX <= 0) {
		// Player two scored
		playerTwoScore += 1;
		createBall();
		return;
	}

	if (ballX >= canvasWidth) {
		// Player one scored
		playerOneScore += 1;
		createBall();
		return;
	}

	// Ball - Paddle collisions
	if (ballX <= playerOnePaddle.x + playerOnePaddle.width + ballRadius) {
		if (
			ballY > playerOnePaddle.y &&
			ballY < playerOnePaddle.y + playerOnePaddle.height
		) {
			// Prevents clipping
			ballX = playerOnePaddle.x + playerOnePaddle.width + ballRadius;

			// Compute collision offset
			let paddleCenter = playerOnePaddle.y + playerOnePaddle.height / 2;
			let distanceFromCenter = ballY - paddleCenter;

			// Normalize to range [-1, 1]
			let normalized = distanceFromCenter / (playerOnePaddle.height / 2);

			// Max bounce angle (radians), e.g. 60°
			let maxBounce = Math.PI / 3;

			// Compute angle
			let bounceAngle = normalized * maxBounce;

			ballXDirection = Math.cos(bounceAngle); // always positive
			ballYDirection = Math.sin(bounceAngle);

			// Make sure it goes to the right (since it bounced from left paddle)
			ballXDirection = Math.abs(ballXDirection);

			if(ballSpeed + ballSpeedIncrease <= maxBallSpeed) {
				ballSpeed += ballSpeedIncrease;
			}
		}
	}

	if (ballX >= playerTwoPaddle.x - ballRadius) {
		if (
			ballY > playerTwoPaddle.y &&
			ballY < playerTwoPaddle.y + playerTwoPaddle.height
		) {
			ballX = playerTwoPaddle.x - ballRadius;

			let paddleCenter = playerTwoPaddle.y + playerTwoPaddle.height / 2;
			let distanceFromCenter = ballY - paddleCenter;
			let normalized = distanceFromCenter / (playerTwoPaddle.height / 2);
			let maxBounce = Math.PI / 3;
			let bounceAngle = normalized * maxBounce;

			ballXDirection = Math.cos(bounceAngle);
			ballYDirection = Math.sin(bounceAngle);

			// Make sure it goes to the left (since it bounced from right paddle)
			ballXDirection = -Math.abs(ballXDirection);

			if(ballSpeed + ballSpeedIncrease <= maxBallSpeed) {
				ballSpeed += ballSpeedIncrease;
			}
		}
	}
}

function clearBoard() {
	context.fillStyle = canvasColor;
	context.fillRect(0, 0, canvasWidth, canvasHeight);
}

function calculatePlayerMovement() {
	// Calculate player one movement
	if (playerOneMovingUp && playerOnePaddle.y > 0) {
		playerOnePaddle.y -= paddleSpeed;
	}

	if (
		playerOneMovingDown &&
		playerOnePaddle.y < canvasHeight - playerOnePaddle.height
	) {
		playerOnePaddle.y += paddleSpeed;
	}

	// Calculate player two movement
	if (playerTwoMovingUp && playerTwoPaddle.y > 0) {
		playerTwoPaddle.y -= paddleSpeed;
	}

	if (
		playerTwoMovingDown &&
		playerTwoPaddle.y < canvasHeight - playerTwoPaddle.height
	) {
		playerTwoPaddle.y += paddleSpeed;
	}
}

function drawPaddles() {
	// Draw player one
	context.fillStyle = paddleColor;
	context.fillRect(
		playerOnePaddle.x,
		playerOnePaddle.y,
		playerOnePaddle.width,
		playerOnePaddle.height
	);

	// Draw player two
	context.fillStyle = paddleColor;
	context.fillRect(
		playerTwoPaddle.x,
		playerTwoPaddle.y,
		playerTwoPaddle.width,
		playerTwoPaddle.height
	);
}

function createBall() {
	// Reset starting speed
	ballSpeed = startingSpeed;

	// Choose a random starting direction
	if (Math.round(Math.random()) == 1) {
		ballXDirection = 1; // Move right
	} else {
		ballXDirection = -1; // Move left
	}

	if (Math.round(Math.random()) == 1) {
		ballYDirection = 1; // Move down
	} else {
		ballYDirection = -1; // Move up
	}

	// Center the ball in the canvas
	ballX = canvasWidth / 2;
	ballY = canvasHeight / 2;
}

function moveBall() {
	ballX += ballSpeed * ballXDirection;
	ballY += ballSpeed * ballYDirection;
}

function drawBall() {
	context.fillStyle = ballColor;
	context.beginPath();
	context.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
	context.fill();
}

let prevBallX = ballX;
let prevBallY = ballY;

function playerAIMovement(player_one_active, player_two_active) {
	const slope = (ballY - prevBallY) / (ballX - prevBallX);

	const predictionY = -slope * playerOnePaddle.x + ballY;

	prevBallX = ballX;
	prevBallY = ballY;

	// Predict ball trajectory y coordinate
	if (player_one_active === false && ballXDirection < 0) {
		const center = playerOnePaddle.y + playerOnePaddle.height / 2;
		playerOneMovingDown = predictionY > center + paddleSpeed;
		playerOneMovingUp = predictionY < center - paddleSpeed;
	} else if (player_two_active === false && ballXDirection > 0) {
		const center = playerTwoPaddle.y + playerTwoPaddle.height / 2;
		playerTwoMovingDown = predictionY > center + paddleSpeed;
		playerTwoMovingUp = predictionY < center - paddleSpeed;
	}
}

function nextTick(player_one_active = true, player_two_active = true) {
	// Runs a game ticks
	intervalID = setTimeout(() => {
		// Check for winning condition
		if (playerOneScore >= winningScore || playerTwoScore >= winningScore) {
			// Reset the game
			resetGame();

			// Stop the game
			return;
		}

		// Re-draw the board
		clearBoard();

		playerAIMovement(player_one_active, player_two_active);

		// Update players coordinates
		calculatePlayerMovement();

		// Re-draw players
		drawPaddles();

		// Update ball coordinates
		moveBall();

		// Check collisions
		checkCollision();

		// Re-draw ball
		drawBall();

		// Schedule next tick
		nextTick(
			(player_one_active = player_one_active),
			(player_two_active = player_two_active)
		);
	}, tickRateMs);
}

function resetGame() {
	// Reset scores
	playerOneScore = 0;
	playerTwoScore = 0;

	// Reset player status
	playerOnePaddle = {
		width: paddleWidth,
		height: paddleHeight,
		x: paddleWallMargin,
		y: (canvasHeight - paddleHeight) / 2,
	};

	playerTwoPaddle = {
		width: paddleWidth,
		height: paddleHeight,
		x: canvasWidth - paddleWidth - paddleWallMargin,
		y: (canvasHeight - paddleHeight) / 2,
	};
}

function initGame() {
	// Attach key events for moving paddles
	window.addEventListener("keydown", function (event) {
		onKeyPressed(
			event.code,
			(player_one_active = false),
			(player_two_active = false)
		);
	});
	window.addEventListener("keyup", function (event) {
		onKeyReleased(
			event.code,
			(player_one_active = false),
			(player_two_active = false)
		);
	});

	// Create the ball
	createBall();

	// Run first game tick
	nextTick((player_one_active = false), (player_two_active = false));
}
