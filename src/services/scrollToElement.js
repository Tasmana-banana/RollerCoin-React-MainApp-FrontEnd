export default function scrollToElement(elementID, offset) {
	offset = offset || 0;
	const element = document.querySelector(elementID);
	if (element) {
		const positionElement = element.getBoundingClientRect();
		setTimeout(() => {
			window.scrollTo(0, positionElement.top + window.scrollY + offset);
		}, 100);
	}
}
