module.exports = LazyStats

/**
 * @constructor
 * @param {number} [dim]
 */
function LazyStats(dim) {
	this.N = 0
	this._mi = Array(dim || 1) // averages
	this._mij = Array(dim || 1) // central products: [[A'A'],[A'B',B'B''],[A'C',B'C',C'C']]
	this.reset()
}

/**
 * @return {LazyStats}
 */
LazyStats.prototype.reset = function() {
	var mij = this._mij
	for (var i=0; i < mij.length; ++i) {
		this._mi[i] = 0
		mij[i] = []
		for (var j=0; j <= i; ++j) mij[i][j] = 0
	}
	return this
}

/**
 * Welford-style online single pass variance and covariance
 * https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
 * @param {number|Array<number>} [values]
 * @returns {number} - number of samples
 */
LazyStats.prototype.push = function(values) {
	var args = Array.isArray(values) ? values : arguments,
			delta = [],
			mij = this._mij

	if (args.length !== mij.length) throw Error(`Expected ${this.dim} value(s)`)
	this.N++
	for (var i=0; i<mij.length; ++i) {
		delta[i] = (args[i] - this._mi[i]) / this.N
		this._mi[i] += delta[i]
		for (var j=0; j<=i; ++j) mij[i][j] += (this.N - 1) * delta[i] * delta[j] - mij[i][j] / this.N
	}
	return this.N
}

/**
 * @memberof LazyStats
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.ave = function(a) {
	return this._mi[a || 0]
}

/**
 * @memberof LazyStats.prototype
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
LazyStats.prototype.cov = function(a, b) {
	if (this.N < 2) return NaN
	return this.N / (this.N - 1) * (a < b ? this._mij[b][a] : this._mij[a][b])
}

/**
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.var = function(a) {
	if (this.N < 2) return NaN
	return this.N / (this.N - 1) * this._mij[a || 0][a || 0]
}

/**
 * @method
 * @name LazyStats#dev
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.dev = function(a) {
	return Math.sqrt(this.var(a))
}

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
LazyStats.prototype.cor = function(a, b) {
	return this.cov(a, b) / Math.sqrt(this.cov(a,a) * this.cov(b, b))
}
