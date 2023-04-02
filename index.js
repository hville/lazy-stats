	/**
		Object.defineProperties(this, {
			vs: {value: new Float64Array(buffer, offset, length)},
			rs: {value: new Float64Array(buffer, offset + byteLn, length)}


			sample dist: 2x8byte array === 16bytes per sample : bytelength = M*16 == M<<4
			lazy stat (M+1)(M+2)/2 = (M**2 + 3M + 2)/2 = M(M+3)/2 + 1

			NN+N+0.25=(N+0.5)^2=2S+0.25
			(2N+1)^2=8S+1
			2N+1 = sqrt(8S+1)
			N = (sqrt(8S+1)-1)/2 = M+1
			M = (sqrt(8S+1)-3)/2
					// need M(M+1)/2 + (M+1) values = (M+1)(M+2)/2 = ((2M + 3)^2 - 1)/8
		// example: 3 dimension needs (3+1)(3+2)/2= 10 values [0][12][345][678][9]; 80 bytes
		//

	 */


export default class LazyStats{
	/**
	 * @param {Float64Array|DataView|ArrayBuffer|number} [memory] number of random variables
	 */
	constructor(memory=1) {
		const buffer = memory.buffer || (memory.byteLength ? M : new ArrayBuffer( 4 * (memory+1)*(memory+2) ))
		let offset = memory.byteOffset || 0
		this.M = Math.floor( ( Math.sqrt( (memory.byteLength || buffer.byteLength) + 1 ) - 3 ) / 2 ) //in case of oversized buffer
		Object.defineProperties(this, {
			_mi: { value: new Float64Array(buffer, offset, (this.M + 1)*(this.M + 2)/2 ) }, // averages, ...fullMemory
			_mij: { value: Array(this.M) }, // M(M+1)/2 central products: [[A'A'],[A'B',B'B''],[A'C',B'C',C'C']]
		})
		offset += 8 * this.M // 8 bytes per value
		for (let i=0; i < this.M; ++i) {
			this._mij[i] = new Float64Array(buffer, offset, i+1)
			offset += this._mij[i].byteLength
		}
	}

	get N() { return this._mi[this._mi.length-1] } //last byte in memory
	set N(count) { return this._mi[this._mi.length-1] = count }

	reset() {
		this._mi.fill(0)
		return this
	}
	// for transfers and copies
	get data() { return this._mi }

	/**
	 * Welford-style online single pass variance and covariance
	 * https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
	 * Add a set of values
	 * @param {number|Array<number>} [values]
	 * @returns {number} - number of samples
	 */
	push(values) {
		const args = Array.isArray(values) ? values : arguments
		if (args.length !== this.M) throw Error(`Expected ${this.M} value(s)`)

		const delta = [],
					N = ++this.N
		for (let i=0; i<this.M; ++i) {
			delta[i] = (args[i] - this._mi[i]) / N
			this._mi[i] += delta[i]
			for (let j=0; j<=i; ++j) {
				this._mij[i][j] += (N - 1) * delta[i] * delta[j] - this._mij[i][j] / N
			}
		}
		return N
	}

	/**
	 * Average of given set
	 * @param {number} [a] index
	 * @return {number} average
	 */
	ave(a=0) {
		return this._mi[a]
	}

	/**
	 * Covariance between 2 sets
	 * @param {number} a index
	 * @param {number} b index
	 * @return {number} covariance
	 */
	cov(a, b) {
		const N = this.N
		if (N < 2) return NaN
		return N / (N - 1) * (a < b ? this._mij[b][a] : this._mij[a][b])
	}

	/**
	 * Variance of a set
	 * @param {number} [a] index
	 * @return {number} variance
	 */
	var(a=0) {
		return this.cov(a, a)
	}

	/**
	 * standard deviation of a set
	 * @param {number} [a] index
	 * @return {number} standard deviation
	 */
	dev(a=0) {
		return Math.sqrt(this.cov(a, a))
	}

	/**
	 * correlation between 2 sets
	 * @param {number} a index
	 * @param {number} b index
	 * @return {number} correlation
	 */
	cor(a, b) {
		return this.cov(a, b) / Math.sqrt(this.cov(a,a) * this.cov(b, b))
	}

	/**
	 * slope between 2 sets dy/dx
	 * @param {number} y index of the dependent set
	 * @param {number} x index
	 * @return {number} slope
	 */
		slope(y, x) {
			return this.cov(y, x) / this.cov(x, x)
		}

	/**
	 * intercept of the linear regression between 2 sets
	 * @param {number} a index of the dependent set
	 * @param {number} b index
	 * @return {number} intercept
	 */
		intercept(y, x) {
			return this.ave(y) - this.slope(y,x) * this.ave(x)
		}
}
