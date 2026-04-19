import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/integration/**/*.test.ts'],
		// Integration tests must run serially — one Resolume instance, shared state
		pool: 'forks',
		poolOptions: {
			forks: { singleFork: true },
		},
		sequence: { concurrent: false },
		testTimeout: 10000,
	},
})
