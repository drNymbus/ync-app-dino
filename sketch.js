const WIDTH = 600;
const HEIGHT = 900;

let CAMERA = -50;

const JUMP_HEIGHT = 10;
const GRAVITY = -0.2;

const PLATFORM_WIDTH = WIDTH/8;
const PLATFORM_HEIGHT = 15;

const PLATFORM_NUMBER = 2;
const PLATFORM_RANGE = HEIGHT/5;
const PLATFORM_BUFFER = 200;

let platforms = [];

function generate_platform(start_y, end_y) {
	const x = random(0 + PLATFORM_WIDTH/2, WIDTH - PLATFORM_WIDTH/2);
	const y = random(start_y + PLATFORM_HEIGHT/2, end_y - PLATFORM_HEIGHT/2);
	return {x: x, y: y};
}

function generate_level(lvl) {
	for (let i=lvl * HEIGHT; i < (lvl+1) * HEIGHT; i += PLATFORM_RANGE) {
		for (let j=0; j < PLATFORM_NUMBER; j++) {
			platforms.push(generate_platform(i, i+PLATFORM_RANGE));
		}
	}
}

let level = 0;
let start_level = 3
let score = 0;
let dino = {
	x: WIDTH/2, y:0,
	w:20, h:35,
	dy:0,
};

let GAME_OVER = false;

function setup() {
	createCanvas(WIDTH, HEIGHT);
	frameRate(90);

	for (let i=0; i < start_level; i++) {
		generate_level(level);
		level++;
	}
}

function dino_collides_platform() {
	if (dino.dy > 0) { return false; }

	for (let i=0; i < platforms.length; i++) {
		const p = platforms[i];

		const y_bound = (dino.y >= p.y)
				&& (dino.y <= p.y + PLATFORM_HEIGHT/2);
		if (y_bound) {
			const x_bound = (dino.x + dino.w/2 >= p.x - PLATFORM_WIDTH/2)
					&& (dino.x - dino.w/2 <= p.x + PLATFORM_WIDTH/2);
			if (x_bound) {
				return true;
			}
		}
	}

	return false;
}

function world_tick() {
	if (GAME_OVER) { return undefined; }

	if (dino.y <= 0 || dino_collides_platform()) {
		dino.dy = JUMP_HEIGHT;
	}
	dino.dy += GRAVITY;
	dino.y += dino.dy;
	if (dino.y > score) score = dino.y;

	// Remove unseen platform and generate new platforms
	if (dino.y/HEIGHT > (level+1) - start_level) {
		if (level - start_level > 1) {
			const nb_platforms = (HEIGHT / PLATFORM_RANGE) * PLATFORM_NUMBER;
			platforms.splice(0, nb_platforms);
		}

		generate_level(level);
		level++;
	}

	if (dino.dy > 0 && dino.y - CAMERA > HEIGHT * 3/5) { CAMERA += dino.dy; }

}

function handle_input() {
	if (keyIsDown(LEFT_ARROW)) {
		dino.x -= 5;
		if (dino.x < 0) { dino.x = 0; }
	} else if (keyIsDown(RIGHT_ARROW)) {
		dino.x += 5;
		if (dino.x > WIDTH) { dino.x = WIDTH; }
	}
}

function draw() {
	handle_input();
	world_tick();

	background(color(107, 138, 199));
	fill(color(0));
	textSize(16);
	text(`SCORE: ${score.toFixed(0)/10}`, 20, 50);
	if (dino.y < CAMERA) {
		GAME_OVER = true;
		textSize(40);
		text("GAME OVER", WIDTH/2 - 110, HEIGHT/2);
	}

	translate(0, CAMERA);


	if (CAMERA < HEIGHT) {
		// draw ground
		fill(color(39, 110, 39));
		rect(-5, HEIGHT, WIDTH+10, 200);
	}

	// draw dino
	fill(color(110, 97, 96));
	rect(dino.x - dino.w/2, HEIGHT - dino.h - dino.y, dino.w, dino.h);

	// draw platforms
	fill(color(207, 17, 203))
	for (let i=0; i < platforms.length; i++) {
		const p = platforms[i];
		rect(p.x - PLATFORM_WIDTH/2, HEIGHT - p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
	}

	console.log(dino.y, CAMERA);
}
