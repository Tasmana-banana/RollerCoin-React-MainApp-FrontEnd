export default function getRndBtnPosition() {
	const random = (array) => array[Math.floor(Math.random() * array.length)];
	const elementsPosition = {
		finishSprite: {
			x: 480,
			y: 220,
		},
		scoreText: {
			x: 480,
			y: 353,
		},
		powerText: {
			x: 480,
			y: 396,
		},
	};
	const btnPositions = [
		{
			reStart: {
				x: 480,
				y: 456,
			},
			orText: {
				x: 480,
				y: 515,
			},
			gain: {
				x: 480,
				y: 571,
			},
		},
		{
			gain: {
				x: 480,
				y: 456,
			},
			orText: {
				x: 480,
				y: 515,
			},
			reStart: {
				x: 480,
				y: 571,
			},
		},
		{
			gain: {
				x: 344,
				y: 479,
			},
			orText: {
				x: 480,
				y: 476,
			},
			reStart: {
				x: 616,
				y: 479,
			},
		},
		{
			gain: {
				x: 616,
				y: 479,
			},
			orText: {
				x: 480,
				y: 476,
			},
			reStart: {
				x: 344,
				y: 479,
			},
		},
	];
	return { ...elementsPosition, ...random(btnPositions) };
}
