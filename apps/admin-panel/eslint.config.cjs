const tseslint = require('typescript-eslint')
const tsSafeql = require('@ts-safeql/eslint-plugin')
const svelte = require('eslint-plugin-svelte')
const prettier = require('eslint-config-prettier')

// ponytail: check-sql needs a URL-parseable DATABASE_URL + live DB at lint time;
// enable only when present, else skip (crash-free dev linting).
let hasValidDbUrl = false
try {
	new URL(process.env.DATABASE_URL)
	hasValidDbUrl = true
} catch {}

const safeql = hasValidDbUrl
	? [
			{
				plugins: {
					'@ts-safeql': tsSafeql
				},
				rules: {
					'@ts-safeql/check-sql': [
						'error',
						{
							connections: [
								{
									connectionUrl: process.env.DATABASE_URL,
									migrationsDir: '../../prisma/migrations',
									targets: [
										{ tag: 'prisma.+($queryRaw|$executeRaw)', transform: '{type}[]' },
										{ tag: 'prismaService.+($queryRaw|$executeRaw)', transform: '{type}[]' },
										{ tag: 'tx.+($queryRaw|$executeRaw)', transform: '{type}[]' },
										{ tag: 'client.+($queryRaw|$executeRaw)', transform: '{type}[]' }
									]
								}
							]
						}
					]
				}
			}
		]
	: []

module.exports = tseslint.config(
	{
		ignores: ['.svelte-kit/', 'build/', 'package/', 'node_modules/', '*.cjs', '.env', '.env.*']
	},
	...tseslint.configs.recommended,
	svelte.configs['flat/recommended'],
	svelte.configs['flat/prettier'],
	prettier,
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	...safeql,
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	}
)
