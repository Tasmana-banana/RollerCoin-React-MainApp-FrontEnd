import { unzlibSync } from "fflate";
/**
 * @param {[number,number][]} data - is an array of [price, quantity] pairs.
 * @param {number} desiredQuantity - is a desired quantity of items.
 * @param {number} balance - is user balance money.
 * @returns {number} - is a price of the desired quantity of items.
 */
const calculateQuantityIsEnoughMoney = (data, desiredQuantity, balance) => {
	let totalPrice = 0;
	let resultMaxQuantity = 0;
	let leftBalance = balance;
	let leftCount = desiredQuantity;
	for (const [price, quantity] of data) {
		if (leftCount <= 0) break;
		if (leftBalance <= 0) break;
		const gotItemsCount = Math.min(leftCount, quantity);
		totalPrice += gotItemsCount * price;
		leftCount -= gotItemsCount;
		let totalCanBuy = Math.floor(leftBalance / price);
		const totalQuantity = Math.min(totalCanBuy, quantity);
		totalPrice = totalQuantity * price;
		leftBalance -= totalPrice;
		resultMaxQuantity += totalQuantity;
	}
	if (resultMaxQuantity === 0) {
		resultMaxQuantity = 1;
	}
	return resultMaxQuantity;
};

export default calculateQuantityIsEnoughMoney;
