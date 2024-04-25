module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
	],
	ignorePatterns: [
		'dist',
		'.eslintrc.cjs',
		'tailwind.config.js',
		'postcss.config.js',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['react-refresh', 'prettier', '@typescript-eslint'],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: 'packages/website/tsconfig.json',
	},
	settings: {
		react: { version: '18.2' },
	},
	rules: {
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
	},
};
