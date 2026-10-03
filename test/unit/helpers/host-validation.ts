/**
 * Mirrors how the Companion 5 host validates a resolved option value against its field definition
 * before it runs an action or feedback. When any option fails (and the field does not set
 * `allowInvalidValues`), Companion skips the action/feedback entirely.
 *
 * Returns the validation error, or undefined when the value is accepted.
 */
export function validateOptionValue(field: Record<string, any>, value: unknown): string | undefined {
	if (field.allowInvalidValues) return undefined

	switch (field.type) {
		case 'textinput': {
			const text = value === undefined || value === null ? '' : String(value)
			if (field.minLength !== undefined && text.length < field.minLength) {
				return `Value must be at least ${field.minLength} characters long`
			}
			const regex = toRegExp(field.regex)
			if (regex && !regex.exec(text)) return `Value does not match regex: ${field.regex}`
			return undefined
		}
		case 'number': {
			if (value === undefined || value === '' || value === null) return 'A value must be provided'
			const n = typeof value === 'number' ? value : Number(value)
			if (isNaN(n)) return 'Value must be a number'
			if (field.min !== undefined && n < field.min && !field.clampValues) return `Value must be greater than or equal to ${field.min}`
			if (field.max !== undefined && n > field.max && !field.clampValues) return `Value must be less than or equal to ${field.max}`
			return undefined
		}
		case 'colorpicker': {
			if (field.returnType === 'number') {
				const n = typeof value === 'number' ? value : Number(value)
				if (isNaN(n)) return 'Value must be a number'
			} else if (typeof value !== 'string' && typeof value !== 'number') {
				return 'Value must be a string or number'
			}
			return undefined
		}
		case 'dropdown': {
			const known = (field.choices as Array<{ id: unknown }>).some((choice) => choice.id == value)
			if (!known && !field.allowCustom) return 'Value is not in the list of choices'
			return undefined
		}
		default:
			return undefined
	}
}

/** Companion stores field regexes as strings such as "/^\\d+$/" or "/^(true|false)$/i". */
function toRegExp(regex: string | undefined): RegExp | null {
	if (!regex) return null
	const match = /^\/(.*)\/([a-z]*)$/.exec(regex)
	return match ? new RegExp(match[1], match[2]) : new RegExp(regex)
}

/** True when the host resolves the value at runtime, so it cannot be validated statically. */
export function isDynamicValue(value: unknown): boolean {
	if (value && typeof value === 'object' && 'isExpression' in value) return true
	return typeof value === 'string' && value.includes('$(')
}
