export default class LogFunc {
	constructor(opts) {
		this.minpos = opts.minpos || 0;
		this.maxpos = opts.maxpos || 100;

		this.minval = Math.log(opts.minval || 1);
		this.maxval = Math.log(opts.maxval || 100);
		this.scale = (this.maxval - this.minval) / (this.maxpos - this.minpos);
	}

	value(position) {
		if (position === 0) {
			return 0;
		}
		return Math.round(Math.exp((position - this.minpos) * this.scale + this.minval));
	}

	position(value) {
		const returnData = Math.ceil(this.minpos + (Math.log(value) - this.minval) / this.scale);
		if (returnData > this.maxpos) {
			return this.maxpos;
		}
		if (returnData < this.minpos) {
			return this.minpos;
		}
		return returnData;
	}
}
