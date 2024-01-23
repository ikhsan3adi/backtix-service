/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', '@ts-safeql/eslint-plugin'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	rules: {
		'@ts-safeql/check-sql': [
			'error',
			{
				connections: [
					{
						connectionUrl: process.env.DATABASE_URL,
						// The migrations path:
						migrationsDir: '../../prisma/migrations',
						targets: [
							// This makes `prisma.$queryRaw` and `prisma.$executeRaw` commands linted
							{ tag: 'prisma.+($queryRaw|$executeRaw)', transform: '{type}[]' },
							{ tag: 'prismaService.+($queryRaw|$executeRaw)', transform: '{type}[]' },
							{ tag: 'tx.+($queryRaw|$executeRaw)', transform: '{type}[]' },
							{ tag: 'client.+($queryRaw|$executeRaw)', transform: '{type}[]' },
						],
					},
				],
			},
		],
	}
}
