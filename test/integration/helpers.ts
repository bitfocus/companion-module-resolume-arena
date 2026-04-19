import { TEST_HOST, REST_PORT } from './config'

/**
 * Returns true if Resolume's REST API is reachable.
 * Used at module level so describe.skipIf can skip the whole file cleanly.
 */
export async function isResolumeReachable(): Promise<boolean> {
	try {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/product`, {
			// @ts-ignore — node-fetch v2 timeout option
			timeout: 1500,
		})
		return res.ok
	} catch {
		return false
	}
}


export function pause(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitFor(condition: () => boolean, timeoutMs: number): Promise<void> {
	const deadline = Date.now() + timeoutMs
	while (Date.now() < deadline) {
		if (condition()) return
		await pause(50)
	}
}
