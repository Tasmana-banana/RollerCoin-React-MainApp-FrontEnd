const { IncomingWebhook } = require("@slack/webhook");
const packageJSON = require("../../package.json");

/**
 * @typedef {{
 *     type: string,
 *     webhook: string,
 * }} Log4jsSlackConfigType
 */

/**
 * @callback Log4jsLayoutFunctionType
 * @param {Log4jsLoggingEventType} loggingEvent
 * @returns {string}
 */

/**
 * @typedef {{
 *     basicLayout: Log4jsLayoutFunctionType,
 *     messagePassThroughLayout: Log4jsLayoutFunctionType,
 *     patternLayout: Log4jsLayoutFunctionType,
 *     colouredLayout: Log4jsLayoutFunctionType,
 *     coloredLayout: Log4jsLayoutFunctionType,
 *     dummyLayout: Log4jsLayoutFunctionType,
 *     addLayout: Log4jsLayoutFunctionType,
 *     layout: Log4jsLayoutFunctionType,
 * }} Log4jsLayoutsType
 */

/**
 * @typedef {{
 * startTime: Date,
 * categoryName: string,
 * data: Array<*>,
 * level: {
 *     level: number,
 *     levelStr: string,
 *     colour: string,
 * },
 * context: {},
 * pid: number,
 * error?: Error,
 * }} Log4jsLoggingEventType
 */

/**
 * This callback is log to slack
 * @callback Log4jsAppenderHandlerType
 * @param {Log4jsLoggingEventType} loggingEvent
 * @param {Log4jsLayoutFunctionType} layout
 */

const LEVEL_TO_COLOR_MAP = {
	TRACE: "#d5e0ed",
	DEBUG: "#5996cd",
	INFO: "#6da646",
	WARN: "#f4b80a",
	ERROR: "#f43408",
	FATAL: "#b80605",
};

/**
 * Slack appender
 * @param {Log4jsSlackConfigType} log4jsConfig
 * @param {Log4jsLayoutFunctionType} layout
 * @return {Log4jsAppenderHandlerType}
 */
function slackAppender(log4jsConfig, layout) {
	const webhook = new IncomingWebhook(log4jsConfig.webhook);
	const pm2InstanceName = `pm2 id ${process.env.INSTANCE_ID || "-"}`;
	const envInstanceName = `env ${process.env.NODE_ENV || "-"}`;
	const instanceName = `${packageJSON.name.toUpperCase()}, ${envInstanceName}, ${pm2InstanceName}`;

	/** @type {Log4jsAppenderHandlerType} */
	const send = async (loggingEvent) => {
		try {
			const level = loggingEvent.level.levelStr;
			await webhook.send({
				color: LEVEL_TO_COLOR_MAP[level] || "#c00",
				username: "Slack error appender",
				fields: [
					{
						title: instanceName,
						value: layout(loggingEvent),
						short: false,
					},
				],
			});
		} catch (e) {
			console.error(`Error sent message to roller_node_error appender chanel: ${e}`);
		}
	};

	/** @type {Array<() => Log4jsAppenderHandlerType>} */
	const queue = [];
	let isExecuting = false;

	const executeQueue = async () => {
		if (isExecuting) {
			return;
		}
		isExecuting = true;
		while (queue.length) {
			const task = queue.shift();
			// eslint-disable-next-line no-await-in-loop
			await task();
		}
		isExecuting = false;
	};

	return async (loggingEvent) => {
		queue.push(() => send(loggingEvent));
		await executeQueue();
	};
}

/**
 * Configure appender
 * @param {Log4jsSlackConfigType} log4jsConfig
 * @param {Log4jsLayoutsType} layouts
 * @return {Log4jsAppenderHandlerType}
 */
function configure(log4jsConfig, layouts) {
	return slackAppender(log4jsConfig, layouts.basicLayout);
}

module.exports.configure = configure;
