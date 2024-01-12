/* eslint-disable global-require */
export default function imageAssetsLoader(pathAndImage) {
	// eslint-disable-next-line import/no-dynamic-require
	return require(`../assets/img/${pathAndImage}`);
}
