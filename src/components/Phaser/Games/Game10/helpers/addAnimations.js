import config from "../config";

const addAnimations = (scene) => {
	// setting player animation
	scene.anims.create({
		key: "hamsterFlip",
		frames: scene.anims.generateFrameNumbers("hamster", {
			start: 4,
			end: 11,
		}),
		frameRate: 15,
		repeat: 0,
	});
	scene.anims.create({
		key: "run",
		frames: scene.anims.generateFrameNumbers("hamster", {
			start: 0,
			end: 1,
		}),
		frameRate: 7,
		repeat: 0,
	});
	scene.anims.create({
		key: "jump",
		frames: scene.anims.generateFrameNumbers("hamster", {
			start: 2,
			end: 3,
		}),
		frameRate: 15,
		repeat: 0,
	});
	scene.anims.create({
		key: "dove",
		frames: scene.anims.generateFrameNumbers("dove", {
			start: 0,
			end: 3,
		}),
		frameRate: 7,
		repeat: -1,
	});
	// setting coin animation
	config.coins.forEach((coin) => {
		scene.anims.create({
			key: `rotate_${coin}`,
			frames: scene.anims.generateFrameNumbers(coin, {
				start: 0,
			}),
			frameRate: 15,
			yoyo: true,
			repeat: -1,
		});
	});
};
export default addAnimations;
