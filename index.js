module.exports = LazyStats

/**
 * @constructor
 * @param {number} [dim]
 */
function LazyStats(dim) {
	this.dim = dim || 1
	this.N = 0
	this._mi = Array(dim) // averages
	this._mij = Array(dim) // central products: [[A'A'],[A'B',B'B''],[A'C',B'C',C'C']]
	this.reset()
}

/**
 * @return {LazyStats}
 */
LazyStats.prototype.reset = function() {
	for (var i=0; i < this.dim; ++i) {
		this._mi[i] = 0
		this._mij[i] = []
		for (var j=0; j <= i; ++j) {
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
LazyStats.prototype.push = function(values) {
	var args = Array.isArray(values) ? values : arguments
	if (args.length !== this.dim) throw Error(`Expected ${this.dim} value(s)`)

	var delta = []
	this.N++
	for (var i=0; i<this.dim; ++i) {
		delta[i] = (args[i] - this._mi[i]) / this.N
		this._mi[i] += delta[i]
		for (var j=0; j<=i; ++j) {
			this._mij[i][j] += (this.N - 1) * delta[i] * delta[j] - this._mij[i][j] / this.N
		}
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
	return this.cov(a || 0, a || 0)
}

/**
 * @method
 * @name LazyStats#dev
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.dev = function(a) {
	return Math.sqrt(this.cov(a || 0, a || 0))
}

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
LazyStats.prototype.cor = function(a, b) {
	return this.cov(a, b) / Math.sqrt(this.cov(a,a) * this.cov(b, b))
}
