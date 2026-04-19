// Integration tests MUST run sequentially (fileParallelism: false).
// All tests share a single live Resolume Arena instance — parallel file
// execution causes state stomping (one file's clearAllLayers racing with
// another file's triggerColumn) that produces spurious failures.
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'node',
		fileParallelism: false,
		include: ['test/integration/**/*.test.ts'],
		testTimeout: 30000,
	},
})
