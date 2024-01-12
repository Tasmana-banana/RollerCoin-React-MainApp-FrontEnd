const fs = require("fs");
const path = require("path");
const config = require("config");
const express = require("express");
const compression = require("compression");
const log4js = require("log4js");
const helmet = require("helmet");
const createError = require("http-errors");
const getLangFormUrl = require("./middleware/getLangFormUrl");
const staticifyQueryParams = require("./middleware/staticifyQueryParams");
const indexRoutes = require("./routes");

const app = express();

const staticFolder = path.join(__dirname, "../", "public");
if (!fs.existsSync(staticFolder)) {
	fs.mkdirSync(staticFolder);
}
const staticifyConfigured = staticifyQueryParams(staticFolder, {
	maxAgeNonHashed: "365d",
});
log4js.configure(config.util.toObject(config.get("log4js")));

const log = log4js.getLogger("app");

/**
 * Express configuration.
 */
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");
app.use((req, res, next) => {
	const test = /\?[^]*\//.test(req.url);
	if (req.url.substr(-1) === "/" && req.url.length > 1 && !test) res.redirect(301, req.url.slice(0, -1));
	else next();
});
// Init middleware
app.use(compression());

app.use(staticifyConfigured.middleware);
app.locals.getVersionedPath = staticifyConfigured.getVersionedPath;

// app.use(helmet(config.get("helmet")));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());

// Add language from url (req.language)
app.use(getLangFormUrl);

// Routing
app.use("/", indexRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

app.use((err, req, res, next) => {
	if (err.code !== "EBADCSRFTOKEN") {
		return next(err);
	}
	log.warn(`Error app: ${err} at route ${req.originalUrl} with method ${req.method} and IP ${req.headers["cf-connecting-ip"]}`);
	log.warn(`Error app stack: ${err.stack}`);
	// handle CSRF token errors here
	res.status(403).send({ success: false, error: "Request not valid" });
});

// error handler
app.use((err, req, res, next) => {
	if (err.status >= 500 || !err.status) {
		log.error(`Error app: ${err} at route ${req.originalUrl} with method ${req.method} and IP ${req.headers["cf-connecting-ip"]}`);
		log.error(`Error app stack: ${err.stack}`);
	}

	if (err.status >= 400) {
		log.warn(`Warning app: ${err} at route ${req.originalUrl} with method and IP ${req.headers["cf-connecting-ip"]}`);
		log.warn(`Warning app stack: ${err.stack}`);
	}

	res.status(err.status || 500);
	if (req.is("application/json")) {
		res.json({ message: "Something went wrong!" });
	} else {
		res.render("index", {
			title: "404 | RollerCoin.com",
			description: "The link is broken or the page has been moved.",
		});
	}
});

module.exports = { app };
