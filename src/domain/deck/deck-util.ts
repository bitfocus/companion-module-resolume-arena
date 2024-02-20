import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, combineRgb} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';

export class DeckUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private initalLoadDone = false;
	private selectedDeck?: number;
	private selectedDeckName?: string;
	private lastDeck?: number;

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'DeckUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition || !this.initalLoadDone) {
			if (compositionState.get() !== undefined) {
				this.initConnectedFromComposition();
				this.initalLoadDone = true;
			}
		}
		if (data.path) {
			if (!!data.path.match(/\/composition\/decks\/\d+\/name/)) {
				this.resolumeArenaInstance.checkFeedbacks('deckName');
			}
			if (!!data.path.match(/\/composition\/decks\/\d+\/select/)) {
				this.resolumeArenaInstance.checkFeedbacks('deckSelected');
				this.resolumeArenaInstance.checkFeedbacks('selectedDeckName');
				this.resolumeArenaInstance.checkFeedbacks('nextDeckName');
				this.resolumeArenaInstance.checkFeedbacks('previousDeckName');
			}
		}
	}

	initConnectedFromComposition() {
		const decks = compositionState.get()?.decks;
		if (decks) {
			this.selectedDeck = undefined;
			for (const [deckIndex, deckObject] of decks.entries()) {
				const deck = deckIndex + 1;
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/decks/' + deck + '/selected');
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/decks/' + deck + '/name');

				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/decks/' + deck + '/selected');
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/decks/' + deck + '/name');
				if (deckObject.selected?.value) {
					this.selectedDeck = deck;
					this.selectedDeckName = deckObject.name?.value;
				}
				this.lastDeck = deck;
			}
		}
		this.resolumeArenaInstance.checkFeedbacks('deckSelected');
		this.resolumeArenaInstance.checkFeedbacks('deckName');
		this.resolumeArenaInstance.checkFeedbacks('selectedDeckName');
		this.resolumeArenaInstance.checkFeedbacks('nextDeckName');
		this.resolumeArenaInstance.checkFeedbacks('previousDeckName');
	}

	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////

	deckSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var deck = feedback.options.deck;
		if (deck !== undefined) {
			return parameterStates.get()['/composition/decks/' + deck + '/select']?.value;
		}
		return false;
	}

	/////////////////////////////////////////////////
	// NAME
	/////////////////////////////////////////////////

	deckNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var deck = feedback.options.deck;
		if (deck !== undefined) {
			return {text: parameterStates.get()['/composition/decks/' + deck + '/name']?.value};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// SELECTED NAME
	/////////////////////////////////////////////////

	deckSelectedNameFeedbackCallback(_feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		if (this.selectedDeck !== undefined) {
			return {
				text: parameterStates.get()['/composition/decks/' + this.selectedDeck + '/name']?.value || this.selectedDeckName,
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			};
		}
		return {};
	}

	/////////////////////////////////////////////////
	// NEXT NAME
	/////////////////////////////////////////////////

	deckNextNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var add = feedback.options.next as number;
		if (this.selectedDeck !== undefined && this.lastDeck != undefined) {
			let deck = this.calculateNextDeck(add);
			return {text: parameterStates.get()['/composition/decks/' + deck + '/name']?.value};
		}
		return {};
	}

	calculateNextDeck(add: number): number {
		let deck = this.selectedDeck!;
		if (deck + add > this.lastDeck!) {
			deck = deck + add - this.lastDeck!;
		} else {
			deck += add;
		}
		return deck;
	}

	/////////////////////////////////////////////////
	// PREVIOUS NAME
	/////////////////////////////////////////////////

	deckPreviousNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var subtract = feedback.options.previous as number;
		if (this.selectedDeck !== undefined && this.lastDeck !== undefined) {
			let deck = this.calculatePreviousDeck(subtract);
			return {text: parameterStates.get()['/composition/decks/' + deck + '/name']?.value};
		}
		return {};
	}

	calculatePreviousDeck(subtract: number): number {
		let deck = this.selectedDeck!;
		if (deck - subtract < 1) {
			deck = this.lastDeck! + deck - subtract;
		} else {
			deck = deck - subtract;
		}
		return deck;
	}
}
