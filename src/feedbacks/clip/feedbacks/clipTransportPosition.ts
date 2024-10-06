import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getColumnOption, getLayerOption} from '../../../defaults';

export function clipTransportPosition(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Transport Position',
		options:
			[...getLayerOption(), ...getColumnOption(),
				{
					id: 'view',
					type: 'dropdown',
					choices: [
						{
							id: 'timestamp',
							label: 'hh:mm:ss'
						},
						{
							id: 'timestampFrame',
							label: 'hh:mm:ss:ff - including frames'
						},
						{
							id: 'timestamp_noHours',
							label: 'mm:ss'
						},
						{
							id: 'timestampFrame_noHours',
							label: 'mm:ss:ff - including frames'
						},
						{
							id: 'fullSeconds',
							label: '10000s'
						},
						{
							id: 'frames',
							label: 'ff - frames'
						},
						{
							id: 'seconds',
							label: 'ss - seconds'
						},
						{
							id: 'minutes',
							label: 'mm - minutes'
						},
						{
							id: 'hours',
							label: 'hh - hours'
						},
						{
							id: 'direction',
							label: '-/+ - timeRemaining or clipTime'
						}
					],
					default: 'timestamp',
					label: 'Visualisation'
				}, {
				id: 'timeRemaining',
				type: 'checkbox',
				default: false,
				label: 'Remaining Time'
			}],
		callback:
			resolumeArenaInstance.getClipUtils()!.clipTransportPositionFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
	};
}
