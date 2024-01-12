module.exports = {
	apps: [
		{
			name: "MainApp",
			script: "./server/index.js",
			autorestart: true,
			exp_backoff_restart_delay: 100,
			exec_mode: "cluster",
			instances: "max", // replased in workflow
			watch: false,
			max_memory_restart: "1G",
			instance_var: "INSTANCE_ID",
			env_development: {
				NODE_ENV: "development",
			},
			env_production: {
				NODE_ENV: "production",
			},
		},
	],
};
