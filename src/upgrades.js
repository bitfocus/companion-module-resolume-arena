export function upgrade_v1_0_4(context, props) {
	let updateActions = []
	
	for (const action of props.actions) {
		switch (action.actionId) {
			case 'custom':
				if (action.options !== undefined && action.options.customCmd !== undefined) {
					action.options.customPath = action.options.customCmd
					delete action.options.customCmd
					updateActions.push(action)
				}
				break
		}
	}

	return {
		updatedConfig: null,
		updatedActions: updateActions,
		updatedFeedbacks: [],
	}
}
