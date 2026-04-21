import { Parser } from 'expr-eval'

const parser = new Parser()

/**
 * Evaluates a math expression string. Returns the result as a string,
 * or the original input if it is not a valid expression.
 */
export function evaluateExpression(input: string): string {
	const trimmed = input.trim()
	try {
		const result = parser.evaluate(trimmed)
		if (typeof result === 'number' && isFinite(result)) {
			return String(result)
		}
		return trimmed
	} catch {
		return trimmed
	}
}

/**
 * Variable-substitution + expression evaluation pipeline.
 * `substituteVariables` should be `instance.parseVariablesInString`.
 */
export async function resolveExpression(
	input: string,
	substituteVariables: (s: string) => Promise<string>
): Promise<string> {
	const substituted = await substituteVariables(input)
	return evaluateExpression(substituted)
}

export async function resolveNumber(
	input: string,
	substituteVariables: (s: string) => Promise<string>
): Promise<number | undefined> {
	const result = await resolveExpression(input, substituteVariables)
	const n = parseFloat(result)
	return isNaN(n) ? undefined : n
}

export async function resolveInt(
	input: string,
	substituteVariables: (s: string) => Promise<string>
): Promise<number | undefined> {
	const n = await resolveNumber(input, substituteVariables)
	return n === undefined ? undefined : Math.round(n)
}
