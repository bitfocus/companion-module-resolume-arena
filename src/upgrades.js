export function upgrade_v1_0_4(context, props) {
	let updateActions = []
	const upgradePass = (action) => {
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

	if (props.actions) {
		for (let k in actions) {
			upgradePass(actions[k])
		}
	}

	return {
		updatedConfig: null,
		updatedActions: updateActions,
		updatedFeedbacks: [],
	}
}
