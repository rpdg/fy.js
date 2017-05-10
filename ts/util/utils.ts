function hasOwnProperty(obj, prop) {
	return !!obj && obj.hasOwnProperty(prop);
}

function setParamsObject(obj, param, value, castBoolean) {
	let reg = /^(.+?)(\[.*\])$/, paramIsArray, match, allKeys, key, k;
	if (match = param.match(reg)) {
		key = match[1];
		allKeys = match[2].replace(/^\[|\]$/g, '').split('][');
		for (let i = 0; k = allKeys[i]; i++) {
			paramIsArray = !k || k.match(/^\d+$/);
			if (!key && is.Array(obj)) key = obj.length;
			if (!hasOwnProperty(obj, key)) {
				obj[key] = paramIsArray ? [] : {};
			}
			obj = obj[key];
			key = k;
		}
		if (!key && paramIsArray) key = obj.length.toString();
		setParamsObject(obj, key, value, castBoolean);
	} else if (castBoolean && value === 'true') {
		obj[param] = true;
	} else if (castBoolean && value === 'false') {
		obj[param] = false;
	} else if (castBoolean && is.Number(value)) {
		obj[param] = parseFloat(value);
	} else {
		obj[param] = value;
	}
}

const request = (function (str: string, castBoolean) {
	let result = {}, split;
	str = (str && str.toString) ? str.toString() : '';
	let arr = str.replace(/^.*?\?/, '').split('&'), p;
	for (let i = 0; p = arr[i]; i++) {
		split = p.split('=');
		if (split.length !== 2) continue;
		setParamsObject(result, split[0], decodeURIComponent(split[1]), castBoolean);
	}
	return result;
})(window.location.href, false);


const is = {
	Array: $.noop,
	RegExp: $.noop,
	Date: $.noop,
	Number: $.noop,
	String: $.noop,
	Object: $.noop,
	HTMLDocument: $.noop,
	UsingIE : $.detectIE() ,
};

let isTypes = ["Array", "RegExp", "Date", "Number", "String", "Object", "HTMLDocument"];
for (let i = 0, c; c = isTypes[i++];) {
	is[c] = (function (type) {
		return function (obj) {
			return Object.prototype.toString.call(obj) == "[object " + type + "]";
		}
	})(c);
}

function objectToQueryString(base, obj) {
	let tmp;
	// If a custom toString exists bail here and use that instead
	if (is.Array(obj) || is.Object(obj)) {
		tmp = [];
		iterateOverObject(obj, function (key, value) {
			if (base)
				key = base + '[' + key + ']';
			tmp.push(objectToQueryString(key, value));
		});
		return tmp.join('&');
	} else {
		if (!base) return '';
		return sanitizeURIComponent(base) + '=' + (is.Date(obj) ? obj.getTime() : sanitizeURIComponent(obj));
	}
}

function sanitizeURIComponent(obj) {
	// undefined, null, and NaN are represented as a blank string,
	// while false and 0 are stringified. "+" is allowed in query string
	return !obj && obj !== false && obj !== 0 ? '' : encodeURIComponent(obj).replace(/%20/g, '+').replace(/%5B/g, '[').replace(/%5D/g, ']');
}

function iterateOverObject(obj, fn) {
	let key: string;
	for (key in obj) {
		if (!hasOwnProperty(obj, key)) continue;
		if (fn.call(obj, key, obj[key], obj) === false) break;
	}
}


const url = {
	addSearch: function (url, pm1, pm2) {

		for (let i = 1, len = arguments.length; i < len; i++) {
			let p = arguments[i];
			if (p !== undefined && p !== null) {
				if (p.indexOf('?') === 0 || p.indexOf('&') === 0)
					p = p.substr(1);

				let prefix = i > 1 ? '&' : (url.indexOf('?') > -1 ? '&' : '?');

				url += (prefix + p);
			}
		}

		return url;
	},
	//opg.url.setParam('http://127.0.0.1:8080/page/home/' , {name:'Bob'}, 'user' );
	//opg.url.setParam('http://127.0.0.1:8080/page/home/' , {name:'Bob'} );
	setParam: function (url, obj, namespace) {
		return url.addSearch(url, objectToQueryString(namespace, obj));
	},
	getParam: function (url, name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(url.substr(url.indexOf('?')));
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
};


const string = {
	_str_pad_repeater: function (s, len) {
		let collect = '';

		while (collect.length < len) {
			collect += s;
		}
		collect = collect.substr(0, len);

		return collect;
	},
	pad: function (input: string, result_full_length: number, pad_string: string = '0', pad_type: 'STR_PAD_LEFT'|'STR_PAD_BOTH'|'STR_PAD_RIGHT' = 'STR_PAD_RIGHT') {
		//   example 1: str.pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
		//   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
		//   example 2: str.pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
		//   returns 2: '------Kevin van Zonneveld-----'

		let half = '',
			pad_to_go;

		input += '';
		pad_string = pad_string !== undefined ? pad_string : ' ';

		if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') {
			pad_type = 'STR_PAD_RIGHT';
		}
		if ((pad_to_go = result_full_length - input.length) > 0) {
			if (pad_type === 'STR_PAD_LEFT') {
				input = string._str_pad_repeater(pad_string, pad_to_go) + input;
			}
			else if (pad_type === 'STR_PAD_RIGHT') {
				input = input + string._str_pad_repeater(pad_string, pad_to_go);
			}
			else if (pad_type === 'STR_PAD_BOTH') {
				half = string._str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
				input = half + input + half;
				input = input.substr(0, result_full_length);
			}
		}

		return input;
	},
	padLeft: function (oStr, result_full_length, pad_string: string = '0') {
		return string.pad(oStr, result_full_length, pad_string, 'STR_PAD_LEFT');
	},
	padRight: function (oStr, result_full_length, pad_string: string = '0') {
		return string.pad(oStr, result_full_length, pad_string || 0, 'STR_PAD_RIGHT');
	}
};


const dateTime = {
	addSeconds: function (d: Date, s: number) {
		return new Date(d.getTime() + s * 1000);
	}
	,
	addDays: function (d: Date, s: number) {
		return new Date(d.getTime() + s * 24 * 3600 * 1000);
	},
	daySpan: function (dateFrom: Date, dateTo: Date) {
		return Math.round((dateTo.valueOf() - dateFrom.valueOf()) / 86400000);
	},
	weekSpan: function (dateFrom: Date, dateTo: Date) {
		let d = dateTime.daySpan(dateFrom, dateTo);
		return Math.ceil((d + dateFrom.getDay()) / 7);
	}

};


const convert = {
	hashKeysToArray: function (obj: Object): Array {
		if (Object.keys) {
			return Object.keys(obj);
		}
		else {
			let arr = [];
			for (arr[arr.length] in obj);
			return arr;
		}
	},
	hashToArray: (obj, convertor?: Function): Array => {
		let arr = [];
		for (let key in obj) {
			let val = obj[key];
			if (convertor)
				val = convertor(val, key);

			arr.push(val);
		}
		return arr;
	},
	arrayToHash: function (arr, key) {
		let obj = {}, i = 0, l = arr.length;
		for (; i < l; i++) {
			let item = arr[i];
			if (!(item[key] in obj)) {
				obj[item[key]] = item;
			}
		}
		return obj;
	},
	stringToDate: function (str, formater) {
		let format = formater || 'yyyy-MM-dd HH:mm:ss'; // default format
		let parts = str.match(/(\d+)/g),
			i = 0,
			fmt = {};
		// extract date-part indexes from the format
		format.replace(/(yyyy|dd|MM|HH|hh|mm|ss)/g, function (part) {
			fmt[part] = i++;
		});
		//
		if (!fmt['HH'] && fmt['hh']) fmt['HH'] = fmt['hh'];

		return new Date(parts[fmt['yyyy']] || 0, (parts[fmt['MM']] || 1) - 1, parts[fmt['dd']] || 0, parts[fmt['HH']] || 0, parts[fmt['mm']] || 0, parts[fmt['ss']] || 0);
	},
	jsonToDate: function (isoString) {
		return new Date(Date.parse(isoString));
	},

	/**
	 * Convert seconds to hh:mm:ss format.
	 * @param {number} totalSeconds - the total seconds to convert to hh- mm-ss
	 **/
	secondsToTimecode: function (totalSeconds: number): string {
		let hours = Math.floor(totalSeconds / 3600);
		let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
		let seconds = totalSeconds - (hours * 3600) - (minutes * 60);

		// round seconds
		seconds = Math.round(seconds * 100) / 100;

		let result = (hours < 10 ? "0" + hours : hours);
		result += ":" + (minutes < 10 ? "0" + minutes : minutes);
		result += ":" + (seconds < 10 ? "0" + seconds : seconds);
		return result;
	},

};


const format = {
	date: function (date: Date, format: string = 'yyyy-MM-dd'): string {
		let o = {
			"M+": date.getMonth() + 1, //month
			"d+": date.getDate(), //date
			"h+": (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()), //hour 12
			"H+": date.getHours(), //hour 24
			"m+": date.getMinutes(), //minute
			"s+": date.getSeconds(), //second
			"q+": Math.floor((date.getMonth() + 3) / 3), //quarter
			"S": date.getMilliseconds() //millisecond
		};

		if (/(y+)/.test(format))
			format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

		for (let k in o)
			if (new RegExp("(" + k + ")").test(format))
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));

		return format;
	},
	toFixed: function (input) {
		let n = Math.round(+input * 100);
		return format.toNFixed(n * .01);
	},
	toNFixed: function (input) {
		let s = (+input).toString(), i = s.indexOf('.');
		if (i < 0) return s + '.00';
		s += '00';
		return s.substr(0, i + 3);
	},
	number: function (number, decimals, dec_point?, thousands_sep?) {
		//   example 1: number_format(1234.56);
		//   returns 1: '1,235'
		//   example 2: number_format(1234.56, 2, ',', ' ');
		//   returns 2: '1 234,56'
		//   example 3: number_format(1234.5678, 2, '.', '');
		//   returns 3: '1234.57'
		//   example 4: number_format(67, 2, ',', '.');
		//   returns 4: '67,00'
		//   example 5: number_format(1000);
		//   returns 5: '1,000'
		//   example 6: number_format(67.311, 2);
		//   returns 6: '67.31'
		//   example 7: number_format(1000.55, 1);
		//   returns 7: '1,000.6'
		//   example 8: number_format(67000, 5, ',', '.');
		//   returns 8: '67.000,00000'
		//   example 9: number_format(0.9, 0);
		//   returns 9: '1'
		//  example 10: number_format('1.20', 2);
		//  returns 10: '1.20'
		//  example 11: number_format('1.20', 4);
		//  returns 11: '1.2000'
		//  example 12: number_format('1.2000', 3);
		//  returns 12: '1.200'
		//  example 13: number_format('1 000,50', 2, '.', ' ');
		//  returns 13: '100 050.00'
		//  example 14: number_format(1e-8, 8, '.', '');
		//  returns 14: '0.00000001'

		number = (number + '')
			.replace(/[^0-9+\-Ee.]/g, '');
		let n = !isFinite(+number) ? 0 : +number,
			prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
			dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
			s = '',
			toFixedFix = function (n, prec) {
				let k = Math.pow(10, prec);
				return '' + (Math.round(n * k) / k)
						.toFixed(prec);
			};
		// Fix forar IE parseFloat(0.55).toFixed(0) = 0;
		let s: Array = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
			.split('.');
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		if ((s[1] || '')
				.length < prec) {
			s[1] = s[1] || '';
			s[1] += new Array(prec - s[1].length + 1)
				.join('0');
		}
		return s.join(dec);
	},
	fileSize: function (filesize) {
		if (filesize >= 1073741824) {
			filesize = format.number(filesize / 1073741824, 2, '.', ',') + ' GB';
		}
		else if (filesize >= 1048576) {
			filesize = format.number(filesize / 1048576, 2, '.', '') + ' MB';
		}
		else if (filesize >= 1024) {
			filesize = format.number(filesize / 1024, 0) + ' KB';
		}
		else {
			//filesize = '< 1KB';
			filesize = format.number(filesize, 0) + ' bytes';
		}
		return filesize;
	},
	json: (function () {
		let pattern = /\${(\w+[.]*\w*)\}(?!})/g;

		return function (template: string, json: any) {
			return template.replace(pattern, function (match, key, value) {
				return json[key];
			});
		}
	})(),
	timeLength: function (seconds: number = 0): string {
		return string.padLeft(Math.floor(seconds / 3600), 2) + ':' + string.padLeft(Math.floor((seconds % 3600) / 60), 2) + ':' + string.padLeft(Math.floor(seconds % 60), 2)
	}
};


const cleanValueObject = function (vo) {
	for (let key in vo)
		if (key.indexOf(":") > -1) delete vo[key];

	return vo;
};


const array = {
	unique: (arr: Array): Array => {
		let tmpArr = [], hash = {};
		for (let i = 0, l = arr.length; i < l; i++) {
			if (!hash[arr[i]]) {
				hash[arr[i]] = true;
				tmpArr.push(arr[i]);
			}
		}

		return tmpArr;
	},
	combine: (...needles: Array[]): Array => {
		let arr = [];
		for (let i = 0, l = needles.length; i < l; i++) {
			let a = needles[i], len = a.length;
			for (let k = 0; k < len; k = k + 5000) {
				arr.push.apply(arr, a.slice(k, k + 5000));
			}
		}
		return arr;
	},
	sort: (arr: Array, propName: string, sortCompareFunction?: Function): Array => {
		if (sortCompareFunction && typeof sortCompareFunction === 'function')
			return arr.sort(sortCompareFunction);

		else {
			let dup = Array.prototype.slice.call(arr, 0);
			//let dup = arr.slice(0);
			if (!arguments.length) return dup.sort();
			//let args = Array.prototype.slice.call(arguments);
			return dup.sort(
				function (a, b) {
					let A = a[propName], nA = isNaN(A), B = b[propName], nB = isNaN(B);
					//两者皆非number
					if (nA && nB) {
						if (A === '') return -1;
						if (B === '') return 1;
						return (A === B ? 0 : A > B ? 1 : -1);
					}
					//a[prop] 非 number, b[prop] 是 number
					else if (nA) return -1;
					//a[prop] 是 number, b[prop] 非 number
					else if (nB) return 1;
					//a[prop], b[prop]  均是 number
					return A === B ? 0 : A > B ? 1 : -1;
				}
			);
		}
	}

};


export {is, url, request, string, dateTime, convert, format, cleanValueObject, array};