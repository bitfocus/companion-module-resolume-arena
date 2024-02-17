export class LayerGroupColumnId {
	private layerGroup: number;
	private column: number;

	constructor(layerGroup: number, column: number) {
		this.layerGroup = layerGroup;
		this.column = column;
	}

	getIdString(): string {
		return `${this.layerGroup}-${this.column}`;
	}

	equals(layerGroup: number, column: number): boolean {
		return this.layerGroup == layerGroup && this.column == column;
	}

	getLayerGroup(): number {
		return this.layerGroup;
	}

	getColumn(): number {
		return this.column;
	}

	static isValid(layerGroup: number | undefined, column: number | undefined): boolean {
		return layerGroup !== undefined && column !== undefined && layerGroup > 0 && column > 0;
	}
}
