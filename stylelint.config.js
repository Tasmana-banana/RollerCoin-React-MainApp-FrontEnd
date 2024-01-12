module.exports = {
	plugins: ["stylelint-prettier", "stylelint-scss"],
	rules: {
		"prettier/prettier": true,
		"color-hex-length": null,
		"rule-empty-line-before": null,
		"no-invalid-position-at-import-rule": null,
		"font-family-no-missing-generic-family-keyword": null,
		"no-descending-specificity": null,
		"scss/dollar-variable-pattern": /^[a-z][a-zA-Z0-9_-]+$/,
		"declaration-block-no-redundant-longhand-properties": [
			true,
			{
				severity: "warning",
			},
		],
		"selector-type-no-unknown": [true, { ignoreTypes: ["disabled"] }],
		"block-no-empty": [
			true,
			{
				severity: "warning",
			},
		],
		"color-function-notation": null,
		"alpha-value-notation": "number",
	},
	extends: ["stylelint-config-standard-scss", "stylelint-config-prettier-scss"],
};
