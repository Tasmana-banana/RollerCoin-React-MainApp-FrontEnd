import * as aes from "aes-js";

export default class AesCBCCTR {
	constructor(secret) {
		this.secretInBytes = aes.utils.utf8.toBytes(secret);
		this.iv = aes.utils.utf8.toBytes(process.env.CRYPTO_IV);
		this.encode = this.encode.bind(this);
		this.decode = this.decode.bind(this);
	}

	encode(stringToEncode) {
		// eslint-disable-next-line new-cap
		const aesCBCObject = new aes.ModeOfOperation.cbc(this.secretInBytes, this.iv);
		const textBytes = aes.utils.utf8.toBytes(stringToEncode);
		const encryptedBytes = aesCBCObject.encrypt(aes.padding.pkcs7.pad(textBytes));
		return this.constructor.arrayBufferToBase64(encryptedBytes);
	}

	decode(base64ToDecode) {
		// eslint-disable-next-line new-cap
		const aesCBCObject = new aes.ModeOfOperation.cbc(this.secretInBytes, this.iv);
		const decryptedBytes = aesCBCObject.decrypt(new Uint8Array(this.constructor.base64ToArrayBuffer(base64ToDecode)));
		const removePadBytes = aes.padding.pkcs7.strip(decryptedBytes);
		const decryptedText = aes.utils.utf8.fromBytes(removePadBytes);
		return decryptedText;
	}

	encodeCTRToHex(stringToEncode) {
		const textBytes = aes.utils.utf8.toBytes(stringToEncode);
		// eslint-disable-next-line new-cap
		const aesCtr = new aes.ModeOfOperation.ctr(this.secretInBytes);
		const encryptedBytes = aesCtr.encrypt(textBytes);
		const encryptedHex = aes.utils.hex.fromBytes(encryptedBytes);
		return encryptedHex;
	}

	static arrayBufferToBase64(buffer) {
		let binary = "";
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i += 1) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	}

	static base64ToArrayBuffer(base64) {
		const binaryString = window.atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i += 1) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}
}
