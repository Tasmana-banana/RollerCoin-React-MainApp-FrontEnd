import { unzlibSync } from "fflate";

/**
 * @param {string} base64string - base64 encoded string.
 * @returns {Uint8Array} - is an array of bytes.
 */
const fromBase64 = (base64string) => new Uint8Array(Buffer.from(base64string, "base64"));

const PAIR_PRICE_SIZE = 4;
const PAIR_QUANTITY_SIZE = 4;
/**
 * @param {Uint8Array} uint8array - is an array of bytes.
 * @returns {[[number, number][], number]} - is an array of [delta, quantity] pairs and price of the first pair.
 */
const binaryDecode = (uint8array) => {
	const dataView = new DataView(uint8array.buffer);
	let offset = 0;
	const rowsCount = dataView.getUint16(offset);
	offset += 2;
	const startPrice = Number(dataView.getBigUint64(offset));
	offset += 8;
	const result = [];
	for (let i = 0; i < rowsCount; i++) {
		const price = dataView.getUint32(offset);
		offset += PAIR_PRICE_SIZE;
		const quantity = dataView.getUint32(offset);
		offset += PAIR_QUANTITY_SIZE;

		result.push([price, quantity]);
	}
	return [result, startPrice];
};

/**
 * @param {[number, number][]} data - is an array of [delta, quantity] pairs.
 * @param {number} startPrice - price of the first pair;
 * @returns {[number, number][]} - is an array of restored [price, quantity] pairs.
 */
const unpackPrice = (data, startPrice) => {
	let prevPrice = startPrice;
	const result = [];
	for (const [price, quantity] of data) {
		prevPrice += price;
		if (quantity === 0) {
			continue;
		}
		result.push([prevPrice, quantity]);
	}
	return result;
};

/**
 * @param {string} base64string - base64 encoded string.
 * @returns {[number,number][]} - is an array of restored [price, quantity] pairs.
 */
const unpackTradeOffers = (base64string) => {
	const compressed = fromBase64(base64string);
	const uint8array = unzlibSync(compressed);
	const [data, startPrice] = binaryDecode(uint8array);
	return unpackPrice(data, startPrice);
};

/**
 * @param {[number,number][]} data - is an array of [price, quantity] pairs.
 * @param {number} desiredQuantity - is a desired quantity of items.
 * @returns {number} - is a price of the desired quantity of items.
 */
const calculatePrice = (data, desiredQuantity) => {
	let totalPrice = 0;
	let leftCount = desiredQuantity;
	for (const [price, quantity] of data) {
		if (leftCount <= 0) break;
		const gotItemsCount = Math.min(leftCount, quantity);
		totalPrice += gotItemsCount * price;
		leftCount -= gotItemsCount;
	}
	return totalPrice;
};

export { unpackTradeOffers, calculatePrice };
