const { merge } = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const common = require("./webpack.common");

const env = process.env.NODE_ENV || "local";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const disableAutoFix = !process.env.DISABLE_AUTO_FIX;

module.exports = merge(common, {
	mode: "development",
	devtool: "inline-source-map",
	watchOptions: {
		ignored: ["log", "node_modules", "public", "server"],
	},
	devServer: {
		static: {
			directory: path.join(__dirname, "./src"),
		},
		client: {
			reconnect: 5,
		},
		liveReload: false,
		compress: true,
		hot: true,
		allowedHosts: "all",
		host: hostname,
		port: 8090,
		proxy: {
			"/api/**": {
				target: "http://localhost:3010",
			},
			"**": {
				target: "http://localhost:3000",
			},
		},
		webSocketServer: false,
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new Dotenv({
			path: `./src/config/.env.${env}`, // load this now instead of the ones in '.env'
			safe: false, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
			systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
			silent: true, // hide any errors
		}),
	],
	optimization: {
		runtimeChunk: false,
	},
});
