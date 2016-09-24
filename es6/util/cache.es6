
const cache = function (key, value) {
	if (!top.window['__CACHE__']) top.window['__CACHE__'] = {};
	var ch = top.window['__CACHE__'];
	if (typeof value !== 'undefined') {
		ch[key] = value;
	}
	return ch[key];
};

const removeCache = function (key) {
	if (!top.window['__CACHE__']) return;
	var ch = top.window['__CACHE__'];
	if (key && ch[key] !== undefined) {
		ch[key] = null;
		delete ch[key];
	}
	else top.window['__CACHE__'] = {};
};



export {cache , removeCache};