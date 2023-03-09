export const Choices = {}

export const Fields = {
	Column: function (id = 'column') {
		return {
			type: 'number',
			label: 'Column',
			id: id,
			min: 1,
			max: 100,
			default: 1,
			required: true,
		}
	},
	Group: function (id) {
		return {
			type: 'number',
			label: 'Group Number',
			id: id,
			min: 1,
			max: 100,
			default: 1,
			required: true,
		}
	},
	LastColumn: function (id) {
		return {
			type: 'number',
			label: `Last (max) Column`,
			id: id,
			min: 1,
			max: 100,
			default: 4,
			required: true,
		}
	},
	Layer: function (id = 'layer') {
		return {
			type: 'number',
			label: 'Layer #',
			id: id,
			min: 1,
			max: 100,
			default: 1,
			required: true,
		}
	},
}
