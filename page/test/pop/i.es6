import {ops, $} from '/es6/ops';


window.closeHandler = function (pop) {
	setTimeout(function () {
		pop.close();
	}, 1000);
};


/*
ops('#tab').tabNavigator({
	data: [{label: '试试看', url: 'about:blank'}, {label: '哈哈国际', url: 'nn'}, {label: '哈哈国际', url: 'nn'}]
});*/

ops('#tab').tabView({
	data: [{label: '试试看', view: '#d1'}, {label: '哈哈国际', view: '#d2'}, {label: '哈哈国际', view: '#d3'}]
});
