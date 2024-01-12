import React, { Component } from "react";
import PropTypes from "prop-types";

export default class CanvasObject extends Component {
	constructor(props) {
		super(props);
		this.canvasElementRef = React.createRef();
	}

	componentDidMount = async () => {
		const { disableRender } = this.props;
		if (disableRender) {
			return true;
		}
		await this.renderCanvas();
	};

	componentDidUpdate = async (prevProps) => {
		const { avatarConfig, gender } = this.props;
		if (JSON.stringify(avatarConfig) !== JSON.stringify(prevProps.avatarConfig) || JSON.stringify(gender) !== JSON.stringify(prevProps.gender)) {
			await this.renderCanvas();
		}
	};

	loadImage = (name, code) => {
		const { gender } = this.props;
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener("load", () => resolve(img));
			img.addEventListener("error", () => reject(new Error(`Failed to load image's URL: ${name}`)));
			img.src = `/static/images/components/${gender}/${name}/${code}.png`;
			img.src = `${process.env.AVATARS_STATIC_URL}/static/images/components/${gender}/${name}/${code}.png`;
		});
	};

	renderCanvas = async () => {
		const { avatarConfig } = this.props;
		if (!avatarConfig) {
			return false;
		}
		const context = this.canvasElementRef.current.getContext("2d");
		context.clearRect(0, 0, this.canvasElementRef.current.width, this.canvasElementRef.current.height);
		try {
			const images = {
				face: await this.loadImage("face", avatarConfig.face),
				clothes: await this.loadImage("clothes", avatarConfig.clothes),
				eye: await this.loadImage("eyes", avatarConfig.eyes),
				hair: await this.loadImage("hair", avatarConfig.hair),
				mouth: await this.loadImage("mouth", avatarConfig.mouth),
			};
			Object.values(images).forEach((img) => {
				context.drawImage(img, 0, 0, this.canvasElementRef.current.width, this.canvasElementRef.current.height);
			});
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		return <canvas ref={this.canvasElementRef} width={400} height={400} />;
	}
}

CanvasObject.propTypes = {
	gender: PropTypes.string.isRequired,
	avatarConfig: PropTypes.object.isRequired,
	disableRender: PropTypes.bool,
};
