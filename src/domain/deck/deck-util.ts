import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';

export class DeckUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private deckSelectedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private deckNameSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'DeckUtils constructor called');
	}

	messageUpdates(data: {path: any}) {
		if(data.path){
			if (!!data.path.match(/\/composition\/decks\/\d+\/name/)) {
				this.resolumeArenaInstance.checkFeedbacks('deckName');
			}
			if (!!data.path.match(/\/composition\/decks\/\d+\/select/)) {
				this.resolumeArenaInstance.checkFeedbacks('deckSelected');
			}
		}
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

	deckSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var deck = feedback.options.deck as number;
		if (deck !== undefined) {
			if (!this.deckSelectedSubscriptions.get(deck)) {
				this.deckSelectedSubscriptions.set(deck, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/decks/' + deck + '/selected');
			}
			this.deckSelectedSubscriptions.get(deck)?.add(feedback.id);
		}
	}

	deckSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var deck = feedback.options.deck as number;
		const deckSelectedSubscription = this.deckSelectedSubscriptions.get(deck);
		if (deck !== undefined && deckSelectedSubscription) {
			deckSelectedSubscription.delete(feedback.id);
			if (deckSelectedSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/decks/' + deck + '/selected');
				this.deckSelectedSubscriptions.delete(deck);
			}
		}
	}

	/////////////////////////////////////////////////
	// NAME
	/////////////////////////////////////////////////
	
	deckNameFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var deck = feedback.options.deck;
		if (deck !== undefined) {
			return {text:parameterStates.get()['/composition/decks/' + deck + '/name']?.value};
		}
		return {};
	}

	deckNameFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var deck = feedback.options.deck as number;
		if (deck !== undefined) {
			if (!this.deckNameSubscriptions.get(deck)) {
				this.deckNameSubscriptions.set(deck, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/decks/' + deck + '/name');
			}
			this.deckNameSubscriptions.get(deck)?.add(feedback.id);
		}
	}

	deckNameFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var deck = feedback.options.deck as number;
		const deckNameSubscription = this.deckNameSubscriptions.get(deck);
		if (deck !== undefined && deckNameSubscription) {
			deckNameSubscription.delete(feedback.id);
			if (deckNameSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/decks/' + deck + '/name');
				this.deckNameSubscriptions.delete(deck);
			}
		}
	}
}
