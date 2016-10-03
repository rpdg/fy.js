import {ops, $} from '../../../es6/ops.es6';


window.fn = function (pop) {
	setTimeout(function () {
		pop.close();
	}, 1000);
};