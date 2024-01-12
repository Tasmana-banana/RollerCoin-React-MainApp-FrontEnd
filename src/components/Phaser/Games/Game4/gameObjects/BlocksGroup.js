import Phaser from "phaser";
import BlockContainer from "./BlockContainer";

export default class BlocksGroup extends Phaser.Physics.Arcade.Group {
	constructor(scene, data) {
		super(scene.physics.world, scene, { immovable: true, allowGravity: false });
		this.scene = scene;
		this.diff = data.diff;
		this.levelHealthMap = {
			1: [1, 1, 1],
			2: [2, 1, 1],
			3: [2, 2, 1],
			4: [2, 2, 2],
			5: [3, 2, 2],
			6: [3, 3, 2],
			7: [3, 2, 2, 1],
			8: [3, 3, 2, 2],
			9: [3, 3, 3, 2],
			10: [3, 3, 3, 2],
		};
		this.blocksCols = 8;
		this.blocksRows = 3 + (this.diff > 6 ? 1 : 0);

		this.initialization();
	}

	initialization() {
		const marginY = 180;
		const marginX = 100;

		this.addBlocks(marginX, marginY);
	}

	addBlocks(marginX, marginY) {
		const addedPosition = 17;
		const blocksPaddingLeft = this.getTextureWidth("chain_horizontal");
		const blocksPaddingTop = this.getTextureHeight("chain_vertical") - 27;
		const defaultBlockWidth = this.getTextureWidth("block1");

		for (let i = 0; i < this.blocksCols; i += 1) {
			const addedBlocksType = [];
			for (let j = 0; j < this.blocksRows; j += 1) {
				const health = this.levelHealthMap[this.diff][j];
				const blockWidth = this.getTextureWidth(`block${health}`);

				let frames = 1;
				if (health > 1) {
					frames = blockWidth / defaultBlockWidth;
				}

				const containerPositionX = marginX + blockWidth / frames / 2 + (blockWidth / frames + blocksPaddingLeft) * i;
				const containerPositionY = addedBlocksType.reduce((acc, bName) => acc + this.getTextureHeight(bName) + blocksPaddingTop, marginY);

				const currentBlockContainer = new BlockContainer(this.scene, { x: containerPositionX, y: containerPositionY, health });
				currentBlockContainer.setDepth(this.blocksRows - addedBlocksType.length);

				const block = this.scene.add.sprite(0, 0, `block${health}`);
				currentBlockContainer.add(block);

				if (j < this.blocksRows && j > 0) {
					const verticalChain = this.scene.add.image(block.x, block.y - block.height / 2 - addedPosition, "chain_vertical");
					currentBlockContainer.add(verticalChain);
				}
				if (i < this.blocksCols && i > 0) {
					const horizontalChain = this.scene.add.image(block.x - block.width / 2 - addedPosition, block.y, "chain_horizontal");
					currentBlockContainer.add(horizontalChain);
				}

				if (health > 1) {
					this.createChangeAnimation(health, frames);
				}

				addedBlocksType.push(`block${health}`);
				this.add(currentBlockContainer);
			}
		}
	}

	getTextureWidth(textureName) {
		return this.scene.textures.get(textureName).getSourceImage().width;
	}

	getTextureHeight(textureName) {
		return this.scene.textures.get(textureName).getSourceImage().height;
	}

	createChangeAnimation(health, frames) {
		for (let i = 0; i < frames; i += 1) {
			this.scene.anims.create({
				key: `block${health}_flash_${i}`,
				frames: this.scene.anims.generateFrameNames(`block${health}`, { start: i, end: i }),
				frameRate: 24,
				repeat: 0,
			});
		}
	}
}
