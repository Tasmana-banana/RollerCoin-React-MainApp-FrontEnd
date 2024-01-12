/* eslint-disable global-require */
const config = require("config");
const log4js = require("log4js");
const http = require("node:http");

const { app } = require("./app");

// We should configure log4js before any other module imports it.
log4js.configure(config.util.toObject(config.get("log4js")));
const log = log4js.getLogger("app");

const LIGHTSHIP_PORT = config.get("lightship.port") ?? 9000;
const LIGHTSHIP_DETECT_K8S = config.get("lightship.detectKubernetes") ?? false;
const LIGHTSHIP_SIGNALS = config.get("lightship.signals") ?? ["SIGINT", "SIGTERM"];

const main = async () => {
	const { createLightship } = await import("lightship");

	const lightship = await createLightship({
		port: LIGHTSHIP_PORT,
		detectKubernetes: LIGHTSHIP_DETECT_K8S,
		signals: LIGHTSHIP_SIGNALS,
	});

	const server = http.createServer(app);

	server
		.listen(config.get("port"), () => {
			log.info("Express server listening on port ", server.address().port);

			lightship.signalReady();
		})
		.on("error", (err) => {
			log.error(err);
			lightship.shutdown();
		});

	lightship.registerShutdownHandler(() => {
		server.close();
	});
};

main().catch((err) => {
	log.error(err);
	process.exit(1);
});
