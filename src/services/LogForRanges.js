export default class LogForRanges {
	constructor(opts) {
		this.minpos = opts.minpos || 0;
		this.maxpos = opts.maxpos || 100;
		this.minval = opts.minval || 1;
		this.maxval = opts.maxval || 100;

		this.points = opts.points || [];
		this.rangeStep = Math.ceil(this.maxpos / this.points.length);
		this.ranges = this.points.map((point, i) => {
			const minPointVal = point;
			const maxPointVal = i === this.points.length - 1 ? this.maxval : this.points[i + 1] - 1;
			const minPointValLog = Math.log(minPointVal);
			const maxPointValLog = Math.log(maxPointVal);
			const minPointPos = this.minpos + this.rangeStep * i;
			const maxPointPos = this.maxpos - this.rangeStep * (this.points.length - 1 - i);
			return { minPointVal, minPointValLog, maxPointVal, minPointPos, maxPointPos, scale: (maxPointValLog - minPointValLog) / (maxPointPos - minPointPos) };
		});
	}

	value(position) {
		if (position === 0) {
			return 0;
		}
		const range = this.ranges.find((obj) => position >= obj.minPointPos && position <= obj.maxPointPos);
		return Math.round(Math.exp((position - range.minPointPos) * range.scale + range.minPointValLog));
	}

	position(value) {
		if (value >= this.maxval) {
			return this.maxpos;
		}
		if (value <= this.minval) {
			return this.minpos;
		}
		const range = this.ranges.find((obj) => +value >= +obj.minPointVal && +value <= +obj.maxPointVal);
		const returnData = Math.ceil(range.minPointPos + (Math.log(value) - range.minPointValLog) / range.scale);
		if (returnData > this.maxpos) {
			return this.maxpos;
		}
		if (returnData < this.minpos) {
			return this.minpos;
		}
		return returnData;
	}
}
