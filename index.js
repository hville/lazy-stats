import byteView from '@hugov/byte-views'

export default class LazyStats{
	/**
	 * @param {Float64Array|number} [memory] number of random variables
	 */
	constructor(size=1) {
		this.M = size.buffer ? Math.floor( ( Math.sqrt( size.byteLength + 1 ) - 3 ) / 2 ) : size
		const N = (this.M + 1)*(this.M + 2)/2
		const memory = size.buffer ? new Float64Array(size.buffer, size.offset, N) : new Float64Array(N)

		Object.defineProperties(this, {
			_mi: { value: memory }, // averages, ...fullMemory
			_mij: { value: Array(this.M) }, // M(M+1)/2 central products: [[A'A'],[A'B',B'B''],[A'C',B'C',C'C']]
		})
		this._mij[0] = new Float64Array(memory.buffer, memory.byteOffset + memory.BYTES_PER_ELEMENT * this.M, 1)
		for (let i=1; i < this.M; ++i)
			this._mij[i] = byteView(this._mij[i-1], Float64Array, i+1)
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
