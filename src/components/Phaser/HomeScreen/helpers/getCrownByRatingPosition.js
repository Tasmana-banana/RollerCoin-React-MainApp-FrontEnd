const getCrownByRatingPosition = (position) => {
	const crownsData = [
		{ image: "crown_gold", min: 1, max: 5 },
		{ image: "crown_silver", min: 6, max: 10 },
		{ image: "crown_bronze", min: 11, max: 100 },
	];
	let returnImage = "crown_metal";
	const crown = crownsData.find((item) => position >= item.min && position <= item.max);
	if (crown) {
		returnImage = crown.image;
	}
	return returnImage;
};
export default getCrownByRatingPosition;
