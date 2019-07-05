module.exports = LazyStats

/**
 * @constructor
 * @param {Object} sample
 */
function LazyStats(sample) {
	this.keys = Object.keys(sample)
	this.dim = this.keys.length
	this.N = 0
	this._li = {} // lows
	this._hi = {} // high
	this._mi = {} // averages
	this._mij = {} // central products: [[A'A'],[A'B',B'B''],[A'C',B'C',C'C']]
	this.reset()
}

/**
 * @return {LazyStats}
 */
LazyStats.prototype.reset = function() {
	var keys = this.keys
	for (var i=0; i < this.dim; ++i) {
		var ki = keys[i]
		this._li[ki] = 0
		this._hi[ki] = 0
		this._mi[ki] = 0
		this._mij[ki] = {}
		for (var j=0; j <= i; ++j) this._mij[ki][keys[j]] = 0
	}
	return this
}

/**
 * Welford-style online single pass variance and covariance
 * https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
 * @param {number|Array<number>} sample
 * @returns {number} - number of samples
 */
LazyStats.prototype.push = function(sample) {
	var delta = [],
			keys = this.keys
	this.N++
	for (var i=0; i<this.dim; ++i) {
		var ki = keys[i],
				vi = sample[ki]
		if (vi < this._li[ki]) this._li[ki] = vi
		else if (vi > this._hi[ki]) this._hi[ki] = vi
		delta[i] = (vi - this._mi[ki]) / this.N
		this._mi[ki] += delta[i]
		for (var j=0; j<=i; ++j) {
			var kj = keys[i]
			this._mij[ki][kj] += (this.N - 1) * delta[i] * delta[j] - this._mij[ki][kj] / this.N
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
	if (a != null) return this._mi[a]
	var keys = this.keys,
			sum = this._mi[keys[0]]
	for (var i=1; i<this.dim; ++i) sum += this._mi[keys[i]]
	return sum/i
}

/**
 * @memberof LazyStats
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.min = function(a) {
	if (a != null) return this._li[a]
	var keys = this.keys,
			min = this._li[keys[0]]
	for (var i=1; i<this.dim; ++i) if (this._li[keys[i]] < min) min = this._li[keys[i]]
	return min
}

/**
 * @memberof LazyStats
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.max = function(a) {
	if (a != null) return this._li[a]
	var keys = this.keys,
			max = this._li[keys[0]]
	for (var i=1; i<this.dim; ++i) if (this._li[keys[i]] > max) max = this._li[keys[i]]
	return max
}

/**
 * @memberof LazyStats.prototype
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
LazyStats.prototype.cov = function(a, b) {
	if (this.N < 2) return NaN
	var mij = this._mij[b][a]
	return this.N / (this.N - 1) * (mij !== null ? mij : this._mij[a][b])
}

/**
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.var = function(a) {
	if (a != null) return this.N / (this.N - 1) * this._mij[a][a]
	var keys = this.keys,
			vars = {}
	for (var i=0; i<this.dim; ++i) {
		var ki = keys[i]
		vars[ki] = this.N / (this.N - 1) * this._mij[ki][ki]
	}
	return vars
}

/**
 * @method
 * @name LazyStats#dev
 * @param {number} [a]
 * @return {number}
 */
LazyStats.prototype.dev = function(a) {
	return Math.sqrt(this.N / (this.N - 1) * this._mij[a][a])
}

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
LazyStats.prototype.cor = function(a, b) {
	return this.cov(a, b) / Math.sqrt(this.var(a) * this.var(b))
}
