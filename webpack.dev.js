const { merge } = require("webpack-merge");
const Dotenv = require("dotenv-webpack");
const common = require("./webpack.common");

module.exports = merge(common, {
	mode: "production",
	plugins: [
		new Dotenv({
			path: `./src/config/.env.development`, // load this now instead of the ones in '.env'
			safe: false, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
			systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
			silent: true, // hide any errors
		}),
	],
});
