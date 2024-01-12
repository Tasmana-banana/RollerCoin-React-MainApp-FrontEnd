export default function getRndPositionResponsive() {
	const random = (array) => array[Math.floor(Math.random() * array.length)];

	const btnPositions = [
		{
			infoY: -190,
			reStart: {
				x: 0,
				y: 60,
			},
			orText: {
				x: 0,
				y: 117,
			},
			gain: {
				x: 0,
				y: 180,
			},
		},
		{
			infoY: -190,
			gain: {
				x: 0,
				y: 180,
			},
			orText: {
				x: 0,
				y: 117,
			},
			reStart: {
				x: 0,
				y: 60,
			},
		},
		{
			infoY: -130,
			gain: {
				x: -136,
				y: 120,
			},
			orText: {
				x: 0,
				y: 117,
			},
			reStart: {
				x: 136,
				y: 120,
			},
		},
		{
			infoY: -130,
			gain: {
				x: 136,
				y: 120,
			},
			orText: {
				x: 0,
				y: 117,
			},
			reStart: {
				x: -136,
				y: 120,
			},
		},
	];
	return random(btnPositions);
}
