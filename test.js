/*eslint-env node, es6*/
var ct = require('cotest'),
		L = require('./')

ct('single set', t => {
	var stat = new L(1)
	t('===', stat.push(3), 1)
	t('===', stat.ave(), 3)
	t('===', isNaN(stat.var(0)), true)
	t('===', stat.push(1), 2)
	t('===', stat.ave(0), 2)
	t('===', stat.N, 2)
	t('===', stat.var(), 2)
})
ct('2 dimensions...', t => {
	var stat = new L(2)
	t('===', stat.push(1,2), 1)
	t('===', stat.push([2,1]), 2)
	t('===', stat.ave(0), 3/2)
	t('===', stat.ave(1), 3/2)
	t('===', stat.var(1), 1/2)
	t('===', stat.cor(0,1), -1)
	t('===', stat.cor(0,0), 1)
})
ct('3 dimensions...', t => {
	var stat = new L(3)
	t('===', stat.push(2,1,0), 1)
	t('===', stat.push([1,1,1]), 2)
	t('===', stat.push(0,1,2), 3)
	t('===', stat.ave(0), 1)
	t('===', stat.ave(1), 1)
	t('===', stat.ave(2), 1)
	t('===', stat.cov(0,0), 1)
	t('===', stat.cov(1,0), 0)
	t('===', stat.cov(1,2), 0)
})
ct('stress test', t => {
	var stat = new L(4)
	for (var i=1; i<1001; ++i) {
		stat.push(i, -i, i/2, 1)
	}
	t('===', stat.ave(0), 1001/2)
	t('===', stat.ave(1), -1001/2)
	t('===', stat.ave(2), 1001/4)
	t('===', stat.ave(3), 1)

	t('===', stat.cor(0,0), 1)
	t('===', stat.cor(1,0), -1)
	t('===', stat.cor(1,2), -1)

	t('===', stat.cov(2,3), 0)
})
