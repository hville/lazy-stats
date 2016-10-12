module.exports = lazyStats

function lazyStats(dim) {
	if (!dim) throw Error('Expected a dimension of 1 or more')
	return new LazyStats(dim)
}
function LazyStats(dim) {
	this.dim = dim
	this.N = 0
	this._mi = [] // averages: [A, B, C]
	this._mij = [] // central products: [[A'A'],[A'B',B'B''],[A'C',B'C',C'C']]
	this.reset()
}
LazyStats.prototype = {
	reset: reset,
	push: push,
	ave: average,
	average: average,
	cov: covariance,
	covariance: covariance,
	var: variance,
	variance: variance,
	std: standardDeviation,
	stddev: standardDeviation,
	standardDeviation: standardDeviation,
	cor: correlation,
	correlation: correlation,
	qty: sampleSize,
	size: sampleSize,
	samplelSize : sampleSize
}
function reset() {
	this._mi.length = 0
	this._mij.length = 0
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
 * @param {number} [a] - values
 * @returns {number} - number of samples
 */
function push() {
	if (arguments.length !== this.dim) throw Error('Expected ' + this.dim + ' argument(s)')
	var delta = []
	this.N++
	for (var i=0; i<this.dim; ++i) {
		delta[i] = (arguments[i] - this._mi[i]) / this.N
		this._mi[i] += delta[i]
		for (var j=0; j<=i; ++j) {
			this._mij[i][j] += (this.N - 1) * delta[i] * delta[j] - this._mij[i][j] / this.N
		}
	}
	return this.N
}
function covariance(a, b) {
	if (this.N < 2) return NaN
	return this.N / (this.N - 1) * (a < b ? this._mij[b][a] : this._mij[a][b])
}
function average(a) {
	return this._mi[a || 0]
}
function variance(a) {
	return this.cov(a || 0, a || 0)
}
function standardDeviation(a) {
	return Math.sqrt(this.cov(a || 0, a || 0))
}
function correlation(a,b) {
	return this.cov(a, b) / Math.sqrt(this.cov(a,a) * this.cov( b, b))
}
function sampleSize() {
	return this.N
}
