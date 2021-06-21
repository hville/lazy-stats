export default class LazyStats{
	/**
	 * @param {number} [dim] number of random variables
	 */
	constructor(dim=1) {
		this.dim = dim
		this.N = 0
		this._mi = Array(dim) // averages
		this._mij = Array(dim) // central products: [[A'A'],[A'B',B'B''],[A'C',B'C',C'C']]
		this.reset()
	}

	reset() {
		for (let i=0; i < this.dim; ++i) {
			this._mi[i] = 0
			this._mij[i] = []
			for (let j=0; j <= i; ++j) {
				this._mij[i][j] = 0
			}
		}
		return this
	}

	/**
	 * Welford-style online single pass variance and covariance
	 * https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
	 * @param {number|Array<number>} [values]
	 * @returns {number} - number of samples
	 */
	push(values) {
		const args = Array.isArray(values) ? values : arguments
		if (args.length !== this.dim) throw Error(`Expected ${this.dim} value(s)`)

		const delta = []
		this.N++
		for (let i=0; i<this.dim; ++i) {
			delta[i] = (args[i] - this._mi[i]) / this.N
			this._mi[i] += delta[i]
			for (let j=0; j<=i; ++j) {
				this._mij[i][j] += (this.N - 1) * delta[i] * delta[j] - this._mij[i][j] / this.N
			}
		}
		return this.N
	}

	/**
	 * @param {number} [a] index
	 * @return {number}
	 */
	ave(a=0) {
		return this._mi[a]
	}

	/**
	 * @param {number} a index
	 * @param {number} b index
	 * @return {number} covariance
	 */
	cov(a, b) {
		if (this.N < 2) return NaN
		return this.N / (this.N - 1) * (a < b ? this._mij[b][a] : this._mij[a][b])
	}

	/**
	 * @param {number} [a] index
	 * @return {number} variance
	 */
	var(a=0) {
		return this.cov(a, a)
	}

	/**
	 * @param {number} [a] index
	 * @return {number} standard deviation
	 */
	dev(a=0) {
		return Math.sqrt(this.cov(a, a))
	}

	/**
	 * @param {number} a index
	 * @param {number} b index
	 * @return {number} correlation
	 */
	cor(a, b) {
		return this.cov(a, b) / Math.sqrt(this.cov(a,a) * this.cov(b, b))
	}
}
