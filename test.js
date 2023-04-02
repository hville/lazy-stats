/*eslint-env node, es6*/
import t from 'assert-op'
import L from './index.js'

t('single set', a => {
	const stat = new L(1)
	a('===', stat.push(3), 1)
	a('===', stat.ave(), 3)
	a('===', isNaN(stat.var(0)), true)
	a('===', stat.push(1), 2)
	a('===', stat.ave(0), 2)
	a('===', stat.N, 2)
	a('===', stat.var(), 2)
})
t('2 dimensions...', a => {
	const stat = new L(2)
	a('===', stat.push(1,2), 1)
	a('===', stat.push([2,1]), 2)
	a('===', stat.ave(0), 3/2)
	a('===', stat.ave(1), 3/2)
	a('===', stat.var(1), 1/2)
	a('===', stat.cor(0,1), -1)
	a('===', stat.cor(0,0), 1)
})
t('3 dimensions...', a => {
	const stat = new L(3)
	a('===', stat.push(2,1,0), 1)
	a('===', stat.push([1,1,1]), 2)
	a('===', stat.push(0,1,2), 3)
	a('===', stat.ave(0), 1)
	a('===', stat.ave(1), 1)
	a('===', stat.ave(2), 1)
	a('===', stat.cov(0,0), 1)
	a('===', stat.cov(1,0), 0)
	a('===', stat.cov(1,2), 0)
})
t('stress test', a => {
	const stat = new L(4)
	for (var i=1; i<1001; ++i) {
		stat.push(i, -i, i/2, 1)
	}
	a('===', stat.ave(0), 1001/2)
	a('===', stat.ave(1), -1001/2)
	a('===', stat.ave(2), 1001/4)
	a('===', stat.ave(3), 1)

	a('===', stat.cor(0,0), 1)
	a('===', stat.cor(1,0), -1)
	a('===', stat.cor(1,2), -1)

	a('===', stat.cov(2,3), 0)
})
t('transfer', a => {
	const src = new L(4)
	for (var i=1; i<1001; ++i) {
		src.push(i, -i, i/2, 1)
	}
	const stat = new L(src.data)
	a('===', stat.N, src.N)
	a('===', stat.M, src.M)
	a('===', stat.ave(0), 1001/2)
	a('===', stat.ave(1), -1001/2)
	a('===', stat.ave(2), 1001/4)
	a('===', stat.ave(3), 1)

	a('===', stat.cor(0,0), 1)
	a('===', stat.cor(1,0), -1)
	a('===', stat.cor(1,2), -1)

	a('===', stat.cov(2,3), 0)
	src.reset()
	a('===', src.N, 0)
	a('===', stat.N, 0)
})
t('slope and intercept', a => {
	const stat = new L(2),
				y = x=> 2*x + 3
	for (let x=-10; x<10; ++x) stat.push( y(x) , x)
	a('===', stat.slope(0,1), 2)
	a('===', stat.intercept(0,1), 3)
})
