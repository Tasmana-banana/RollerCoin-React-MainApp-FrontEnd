const Moment = require("moment");
const MomentRange = require("moment-range");

const moment = MomentRange.extendMoment(Moment);
const createDateRangeArray = (startDate = new Date(), endDate = new Date()) => {
	const dateRangeMoment = moment().range(startDate, endDate);
	return Array.from(dateRangeMoment.by("day")).map((date) => Moment(date).format("YYYY-MM-DD"));
};
export default createDateRangeArray;
