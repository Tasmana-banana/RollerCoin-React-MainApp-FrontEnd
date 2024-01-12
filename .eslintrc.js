module.exports = {
	env: {
		node: true,
		es2021: true,
		browser: true,
	},
	parser: "@babel/eslint-parser",
	plugins: ["react", "prettier"],
	extends: ["airbnb-base", "plugin:react/recommended", "plugin:prettier/recommended", "eslint:recommended"],
	settings: {
		react: {
			pragma: "React",
			version: "detect",
		},
		"import/resolver": {
			node: {
				paths: ["src"],
			},
		},
		propWrapperFunctions: ["forbidExtraProps"],
	},
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	rules: {
		"no-await-in-loop": "warn",
		"react/prop-types": "warn",
		"react/display-name": "warn",
		"react/no-unescaped-entities": "warn",
		"react/jsx-uses-react": "error",
		"react/jsx-uses-vars": "error",
		"react/prefer-es6-class": ["error", "always"],
		"prettier/prettier": "error",
		"no-undef": 0, // remove
		"no-unused-vars": 0, // remove
		"no-underscore-dangle": 0,
		"no-console": ["warn", { allow: ["error", "clear"] }],
		"lines-around-directive": 0, // remove
		"import/no-extraneous-dependencies": 0, // remove
		"default-param-last": 0,
		strict: 0, // ???
		"no-param-reassign": 0,
		"consistent-return": 0,
		"prefer-const": 0,
		"no-plusplus": 0,
		"no-use-before-define": 0,
		"prefer-destructuring": [
			"error",
			{
				array: false,
				object: true,
			},
			{
				enforceForRenamedProperties: false,
			},
		],
		"class-methods-use-this": [
			"error",
			{
				exceptMethods: ["render", "componentDidMount", "componentDidUpdate"],
			},
		],
		"no-restricted-modules": [
			"error",
			{
				name: "moment",
				message: "Stop using 'moment.js', please use 'dayjs'",
			},
			{
				name: "react-lazyload",
				message: "Stop using 'react-lazyload', please use 'react-lazy-load-image-component'",
			},
		],
	},
};
