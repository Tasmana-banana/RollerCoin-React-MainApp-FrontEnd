class Version {
	constructor() {
		this.version = new Date().getTime();
	}

	get() {
		return this.version;
	}
}

const globalAvatarVersion = new Version();

export default globalAvatarVersion;
