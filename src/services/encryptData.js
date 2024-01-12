import AesCBCCTR from "./aesCBCCTR";
import generateSecret from "./generateSecret";

const encryptData = (data, key) => {
	const aesCBCCTR = new AesCBCCTR(generateSecret(key));
	const encodedData = aesCBCCTR.encode(typeof data !== "string" ? JSON.stringify(data) : data);
	return encodedData;
};

export default encryptData;
