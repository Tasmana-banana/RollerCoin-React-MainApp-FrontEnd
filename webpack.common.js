const webpack = require("webpack");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const imageminMozjpeg = require("imagemin-mozjpeg");
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const disableMinification = !!process.env.DISABLE_MINIFICATION;
const disableAutoFix = !process.env.DISABLE_AUTO_FIX;

module.exports = {
	entry: {
		app: [path.resolve(__dirname, "./src/index.js")],
	},
	output: {
		path: path.resolve(__dirname, "./public/static/"),
		publicPath: "/static/",
		chunkFilename: "js/[name].bundle.js?v=[contenthash]",
		filename: "js/bundle.js",
		hashDigestLength: 20,
	},
	plugins: [
		new CleanWebpackPlugin(),
		new NodePolyfillPlugin(),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, "./src/assets/img/"),
					to: "img/[path][name][ext]",
				},
				{
					from: path.resolve(__dirname, "./src/additional/fav/"),
					to: "fav/[name][ext]",
				},
				{
					from: path.resolve(__dirname, "./src/additional/favicon.ico"),
					to: "favicon.ico",
				},
				{
					from: path.resolve(__dirname, "./src/additional/manifest.json"),
					to: "manifest.json",
				},
				{
					from: path.resolve(__dirname, "./src/additional/pwa/"),
					to: "pwa/[name][ext]",
				},
				{
					from: path.resolve(__dirname, "./src/languages"),
					to: "locales",
					toType: "dir",
					transform(content) {
						try {
							const json = JSON.parse(content.toString());
							return JSON.stringify(json);
						} catch (e) {
							return content.toString();
						}
					},
				},
				{
					from: path.resolve(__dirname, "./src/additional/SendPulse/"),
					to: "../[name][ext]",
				},
				{
					from: path.resolve(__dirname, "./src/additional/*[.html, .txt, .pdf, .xml]"),
					to: "../[name][ext]",
				},
			],
		}),
		new ImageminPlugin({
			disable: true,
			optipng: {
				optimizationLevel: 9,
			},
			gifsicle: {
				interlaced: false,
				optimizationLevel: 2,
			},
			jpegtran: {
				disabled: true,
			},
			svgo: {
				removeViewBox: true,
			},
			plugins: [
				new ESLintPlugin(),
				imageminMozjpeg({
					progressive: true,
					quality: 65,
				}),
			],
		}),
		new webpack.IgnorePlugin({
			resourceRegExp: /^\.\/locale$/,
			contextRegExp: /moment$/,
		}),
		new webpack.ProvidePlugin({
			Buffer: ["buffer", "Buffer"],
		}),
		new webpack.ProvidePlugin({
			process: "process/browser",
		}),
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					{
						loader: "style-loader",
					},
					{
						loader: "css-loader",
						options: {
							url: true,
							importLoaders: 1,
						},
					},
					"postcss-loader",
					{
						loader: "sass-loader",
					},
				],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
				generator: {
					filename: "images/[name].[hash].[ext]",
				},
			},
			{
				test: /\.(webm|mp4)$/,
				type: "asset/resource",
				generator: {
					filename: "videos/[name].[hash].[ext]",
				},
			},
			{
				test: /\.(ttf|eot|woff|woff2|mp3)$/,
				type: "asset/resource",
				generator: {
					filename: "[name].[hash].[ext]",
				},
			},
		],
	},
	optimization: {
		splitChunks: {
			chunks: "async",
			minSize: 20000,
			minRemainingSize: 0,
			minChunks: 1,
			maxAsyncRequests: 30,
			maxInitialRequests: 30,
			enforceSizeThreshold: 50000,
			cacheGroups: {
				defaultVendors: {
					test: /[\\/]node_modules[\\/]/,
					priority: -10,
					reuseExistingChunk: true,
				},
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true,
				},
			},
		},
	},
	resolve: {
		// 	extensions: [".ts", ".js"],
		// 	fallback: {
		// 		stream: require.resolve("stream-browserify"),
		// 		buffer: require.resolve("buffer"),
		// 	},
		fallback: {
			crypto: false,
		},
	},
};
