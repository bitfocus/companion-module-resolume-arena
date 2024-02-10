export class ClipId {
	private layer: number;
	private column: number;

	constructor(layer: number, column: number) {
		this.layer = layer;
		this.column = column;
	}

	getIdString(): string {
		return `${this.layer}-${this.column}`;
	}

	equals(layer: number, column: number): boolean {
		return this.layer == layer && this.column == column;
	}

	getLayer(): number {
		return this.layer;
	}

	getColumn(): number {
		return this.column;
	}

	static isValid(layer: number | undefined, column: number | undefined): boolean {
		return layer !== undefined && column !== undefined && layer > 0 && column > 0;
	}
}
