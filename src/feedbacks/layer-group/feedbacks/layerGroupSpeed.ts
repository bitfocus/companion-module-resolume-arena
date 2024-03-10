// import {ResolumeArenaModuleInstance} from '../../index';
// import {getLayerGroupOption} from '../../defaults';
// import {CompanionFeedbackDefinition} from '@companion-module/base';
//
// // TODO #46, resolume feature request
// export function layerGroupSpeed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
// 	return {
// 		type: 'advanced',
// 		name: 'Layer Group Speed',
// 		options: [...getLayerGroupOption()],
// 		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
// 		subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
// 		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
// 	};
// }