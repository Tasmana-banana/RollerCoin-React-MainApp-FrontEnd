import Phaser3 from "phaser";
import gameObjectMixin from "../mixins/gameObjectMixin";
import Randomize from "../../helpers/randomize";

// Platfrom0 = default
// Platform1 = destroyble after first jump
// Platform2 = fake

class Platform extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, prevPlatform, scoreNow) {
		super(scene, x, y, "platform0");
		this.scene = scene;
		this.type = 0;
		this.textureName = "platform0";
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.scene.platformPool.add(this);
		this.scene.events.on("update", this.checkUpdate, this);
		this.initialization(x, y, prevPlatform, scoreNow);
	}

	initialization(x, y, prevPlatform, scoreNow) {
		this.setOrigin(0.5, 0);
		this.body.enable = true;
		this.hasObstacle = false;
		this.body.setVelocityX(0);
		this.body.setAllowGravity(false);
		this.move = false;
		this.child = null;
		this.body.checkCollision.down = false;
		this.body.checkCollision.left = false;
		this.body.checkCollision.right = false;
		this.body.setSize(this.width, this.height, 0, 0);
		this.rollType(x, y, prevPlatform, scoreNow);
	}

	// Roll order by Phaser2 version
	rollType(coordinateX, foundY, prevPlatform, scoreNow) {
		if (prevPlatform.type !== 2 && Randomize.roll(5 * this.scene.diff)) {
			this.type = 2;
			this.setTexture("platform2");
		} else if (Randomize.roll(10 * this.scene.diff)) {
			this.type = 1;
			this.setTexture("platform1");
		}
		if (scoreNow > 1000 && Randomize.roll(scoreNow / 400)) {
			this.movingItems(scoreNow);
		}
	}

	checkUpdate() {
		this.changeDirection();
	}
}

Object.assign(Platform.prototype, gameObjectMixin);

export default Platform;
