<!-- markdownlint-disable MD036 MD041 -->

# lazy-stats

*online average, variance, covariance and correlation*

• [Example](#example) • [Features](#features) • [Limitations](#limitations) • [API](#api) • [License](#license)

## Example

```javascript
var LazyStats = require('lazy-stats')
var stat = new LazyStats(3), // for 3 random variables

stat.push(2,1,0)
stat.push([1,1,1])
stat.push(0,1,2)

var average0 = stat.ave(0)
    average1 = stat.ave(1)
    variance2 = stat.var(2)
    covariance12 = stat.cov(1,2)
    correlation20 = stat.cor(2,0)
```

## Features

* very small code and footprint for large number of instances
* only stores the summary values (average and covariances)
* uses [Welford-style online single pass variance and covariance algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance)
* less than 100 sloc, no dependencies

## Limitations

* all variables must have the same number of samples, pushed at the same time
* no skew and kurtosis

## API

## Properties

* `.N` number: total samples received

## Methods

* `.push(number0, number1, ...) => {number} sampleSize` - add sample value(s) and returns the sampe size
* `.push([number0, number1, ...]) => {number} sampleSize` - add array of sample value(s) and returns the sampe size
* `.ave(index) => {number}` - average of a given dataset
* `.var(index) => {number}` - variance of a given dataset
* `.dev(index) => {number}` - standard deviation of a given dataset
* `.cov(i, j) => {number}` - covariance between two datasets
* `.cor(i, j) => {number}` - correlation between two datasets
* `.reset() => {object} this` - clears all sums and counts back to 0

# License

Released under the [MIT License](http://www.opensource.org/licenses/MIT)
