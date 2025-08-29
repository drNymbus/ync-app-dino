const WIDTH = 600;
const HEIGHT = 900;

let MOBILE = false;

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
	const y = random(start_y + PLATFORM_HEIGHT, end_y - PLATFORM_HEIGHT);
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

let SOUND = undefined;
let MUTE = true;
let SOUND_ICON_PLAY = undefined;
let SOUND_ICON_MUTE = undefined;

function preload() {
	SOUND = createAudio('assets/musique_bien.mp3');
	SOUND_ICON_PLAY = loadImage('assets/sound_icon.png', undefined, err => console.error(`Loading icon failed: ${err}`));
	SOUND_ICON_MUTE = loadImage('assets/mute_icon.png', undefined, err => console.error(`Loading icon failed: ${err}`));

	if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(navigator.userAgent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
		MOBILE = true;
		angleMode(DEGREES);
	}
}

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

function toggleSound() {
	if (MUTE && SOUND !== undefined) {
		MUTE = false;
		SOUND.loop();
	} else if (SOUND !== undefined) {
		MUTE = true;
		SOUND.stop();
	}
}

function keyPressed() {
	if (key === 's') {
		toggleSound();
	}
}

function handle_input() {
	if (MOBILE) {
		dino.x = rotationX;
		if (dino.x < 0) { dino.x = 0; }
		if (dino.x > WIDTH) { dino.x = WIDTH; }
	} else {
		if (keyIsDown(LEFT_ARROW)) {
			dino.x -= 3;
			if (dino.x < 0) { dino.x = 0; }
		} else if (keyIsDown(RIGHT_ARROW)) {
			dino.x += 3;
			if (dino.x > WIDTH) { dino.x = WIDTH; }
		}
	}

	if (mouseIsPressed) {
		toggleSound();
	}
}

function draw() {
	background(color(107, 138, 199));

	handle_input();
	world_tick();
	if (dino.y < CAMERA) {
		GAME_OVER = true;
	}

	push();
	translate(0, CAMERA);

	// draw ground
	if (CAMERA < HEIGHT) {
		fill(color(39, 110, 39));
		rect(-5, HEIGHT, WIDTH+10, 200);
	}

	// draw dino
	if (!GAME_OVER) {
		fill(color(110, 97, 96));
		rect(dino.x - dino.w/2, HEIGHT - dino.h - dino.y, dino.w, dino.h);
	}

	// draw platforms
	fill(color(207, 17, 203))
	for (let i=0; i < platforms.length; i++) {
		const p = platforms[i];
		rect(p.x - PLATFORM_WIDTH/2, HEIGHT - p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
	}
	pop();

	fill(color(0));
	textSize(16);
	text(`SCORE: ${score.toFixed(0)/10}`, 20, 50);
	if (GAME_OVER) {
		textSize(40);
		text("GAME OVER", WIDTH/2 - 110, HEIGHT/2);
	}

	if (SOUND_ICON_PLAY !== undefined && !MUTE) {
		image(SOUND_ICON_PLAY, WIDTH - 100, 50, 50, 50);
	} else if (SOUND_ICON_MUTE !== undefined) {
		image(SOUND_ICON_MUTE, WIDTH - 100, 50, 50, 50);
	}
}
