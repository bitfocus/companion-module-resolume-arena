import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {DeckUtils} from '../../../domain/deck/deck-util';
import {WebsocketInstance} from '../../../websocket';

export function selectDeck(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	deckUtils: () => DeckUtils | null
): CompanionActionDefinition {
	return {
		name: 'Select Deck',
		options: [
			{
				id: 'action',
				type: 'dropdown',
				choices: [
					{
						id: 'add',
						label: '+',
					},
					{
						id: 'subtract',
						label: '-',
					},
					{
						id: 'set',
						label: '=',
					},
				],
				default: 'set',
				label: 'Action',
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value',
				useVariables: true,
			},
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theDeckUtils = deckUtils();
			if (theApi && theDeckUtils) {
				const action = options.action;
				const value = +options.value as number;
				if (action != undefined) {
					let deck: number | undefined;
					switch (options.action) {
						case 'set':
							deck = value;
							break;
						case 'add':
							deck = theDeckUtils.calculateNextDeck(value);
							break;
						case 'subtract':
							deck = theDeckUtils.calculatePreviousDeck(value);
							break;
						default:
							break;
					}
					if (deck != undefined) {
						websocketApi()?.triggerPath('/composition/decks/' + deck + '/select');
					}
				}
			}
		},
	};
}
