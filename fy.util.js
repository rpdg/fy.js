(function (window, $, fy, undefined) {
	fy.EMPTY_FN = $.noop ;
	fy.PREVENT_FN = function(){
		return false;
	};


	/*
	 Server resource url to name class
	 @config: fy.server({userList : "userList.ashx" , login : "login.ashx"});
	 @usage: fy.server["userList"].getJSON(param , callback);
	 服务器返回 JSON 数据包的基本格式
	 {
	    data : [], // object, array , ect.
	    error: 0 // or: null/false, or "access forbidden" etc.
	 }
	 */
	var srvFn = function (url) {
		if(url.indexOf('http://')===0||url.indexOf('https://')===0) this.url = url ;
		else this.url = fy.serverRootPath + url.replace(/^['/']/, '');
		//this.xhr = $.ajaxSettings.xhr() ;
		this.unlimited = false ;
		this.accessable = true;
	};
	//map ajax functions to jQuery
	function makeParam(data, callback, type) {
		var that = this;
		//todo: here may want be optimized
		var fn = function (json) {
				if (json.error) srvFn.prototype.handleError.call(that, json.error);
				else (typeof data === 'function') ? data(json) : (callback && typeof callback==='function') ? callback(json) : void(0);
				that.accessable = true ;
				that = null ;
			} ,
			param = (typeof data != 'function')? data: null ,
			vType = (typeof type === 'string') ? type : (typeof callback === 'string' ? callback : undefined);

		return [this.url , param , fn , vType];
	}

	srvFn.prototype = {
		handleError: function (err) {
			if (typeof this.onError === 'function') this.onError(err);
			else if (typeof fy.onAjaxError === 'function') {
				if (fy.server.isLocal) {
					var actionCode = this.url.split('actionCode=');
					if (actionCode.length > 1) actionCode = actionCode[1].split('&')[0];
					else actionCode = false;
					if (actionCode) err = '[code]: <b>' + actionCode + '</b>, <br>' + err;
				}
				fy.onAjaxError.call(this, err);
			}
		},
		toString: function(){
			return this.url;
		},
		getJSON: function (data, callback) {
			//log('native' , this.xhr);
			if(this.accessable || this.unlimited){
				this.accessable = false ;
				return $.getJSON.apply(this, makeParam.call(this, data, callback, "json"));
			}
		},
		get: function (data, callback, type) {
			if(this.accessable || this.unlimited) {
				this.accessable = false;
				return $.get.apply(this, makeParam.call(this, data, callback, type));
			}
		},
		post: function (data, callback, type) {
			if(this.accessable || this.unlimited) {
				this.accessable = false;
				return $.post.apply(this, makeParam.call(this, data, callback, type));
			}
		},
		postObj: function (obj, callback, type) {
			return this.post({vo: JSON.stringify(obj)}, callback, type);
		} ,
		postValue : function(obj, callback, type) {
			for (var key in obj) {
				var v = {};
				v[key] = JSON.stringify(obj[key]);
				return this.post(v, callback, type);
				//break;
			}
		}
	};
	fy.server = function (urlSet, override) {
		if (urlSet) fy.server.add(urlSet, override);
		return fy.server;
	};
	fy.server.add = function (urlHashSet, override) {
		var that = fy.server , unwritable = !override;

		//fy.server.add('key' , 'url');
		if (typeof urlHashSet === "string" && typeof override === "string") {
			var p1 = urlHashSet;
			urlHashSet = {};
			urlHashSet[p1] = override;
			unwritable = true;
		}


		for (var key in urlHashSet) {
			if ((key in that) && unwritable) {
				//throw new Error('重复定义 fy.server["'+key+'"] !' , 'fy.server.error') ;
			}
			else
				that[key] = new srvFn(urlHashSet[key]);
		}
		return that;
	};
	fy.server.isLocal = (location.hostname.indexOf('127.0.0.1') > -1 || location.hostname.indexOf('localhost') > -1);
	fy.server.isLAN = (location.hostname.split(".")[0]in{192: 1, 172: 1, 10: 1} || fy.server.isLocal );

	/*var SrvCalls = function(calls){
	 var l = calls.length , step = 0 ;
	 for(var i = 0;  i<l ; i++){
	 calls[i].getJSON()
	 }
	 };
	 SrvCalls.prototype.done = function(fn){
	 this.done = fn ;
	 };

	 fy.server.when = function(calls){
	 return new SrvCalls(calls) ;
	 };*/


	// <---
	/*(function() {
	 var a =  document.createElement('a');
	 a.href = url;
	 return {
	 source: url,
	 protocol: a.protocol.replace(':',''),
	 host: a.hostname,
	 port: a.port,
	 query: a.search,
	 params: (function(){
	 var ret = {},
	 seg = a.search.replace(/^\?/,'').split('&'),
	 len = seg.length, i = 0, s;
	 for (;i<len;i++) {
	 if (!seg[i]) { continue; }
	 s = seg[i].split('=');
	 ret[s[0]] = s[1];
	 }
	 return ret;
	 })(),
	 file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
	 hash: a.hash.replace('#',''),
	 path: a.pathname.replace(/^([^\/])/,'/$1'),
	 relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
	 segments: a.pathname.replace(/^\//,'').split('/')
	 };
	 })();*/

	//default root path
	fy.serverRootPath = "/";

	//default ajax error message shown
	fy.onAjaxError = function (err) {
		fy.alert(err.toString());
	};

	//a log tool
	window.log = function (debug) {
		if (debug) {
			if (!!window.console) {
				function mkArg(l) {
					var args = [];
					while (l--) args[l] = l;
					return 'arguments[' + args.join("],arguments[") + ']';
				}

				window.log = function () {
					eval('console.log(' + mkArg(arguments.length) + ')');
				};
				window.log.error = function () {
					eval('console.error(' + mkArg(arguments.length) + ')');
				};
				window.log.warn = function () {
					eval('console.warn(' + mkArg(arguments.length) + ')');
				};
			}
			else {
				document.write('<div id="fylogTracer001"></div>');
				var e = document.getElementById("fylogTracer001");
				window.log = function () {
					if (e.scrollHeight > 600) e.innerHTML = '';
					else e.innerHTML += "<p>";
					for (var i = 0 , len = arguments.length; i < len; i++) {
						e.innerHTML += (JSON.stringify(arguments[i]) || arguments[i]) + " ";
					}
					/*for (var i = 0, l = arguments.length ; i < l ; i++)
					 alert(JSON.stringify(arguments[i])) ;*/
				}
			}
		}
		else {
			window.log = function () {
			};
			window.log.warn = window.log.error = fy.EMPTY_FN;
		}
	};

	//string formatting util
	fy.formatString = function (template, params) {
		if (arguments.length == 1)
			return function () {
				var args = $.makeArray(arguments);
				args.unshift(template);
				return $.validator.format.apply(this, args);
			};
		if (arguments.length > 2 && params.constructor != Array) {
			params = $.makeArray(arguments).slice(1);
		}
		if (params.constructor != Array) {
			params = [ params ];
		}
		$.each(params, function (i, n) {
			template = template.replace(new RegExp("\\{" + i + "\\}", "g"), n);
		});
		return template;
	};

	//json formatting
	fy.formatJSON = (function () {
		var pattern = /\{(\w*[:]*[=]*\w+)\}(?!})/g;
		return function (template, json) {
			return template.replace(pattern, function (match, key, value) {
				return json[key];
			});
		}
	})();


	//cookie processor
	fy.cookie = function (name, value, options) {
		if (typeof value != 'undefined') {
			// name and value given, set cookie
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			// convert value to JSON string
			if (typeof value === 'object' && JSON.stringify) {
				value = JSON.stringify(value);
			}
			var expires = '';
			// Set expiry
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				}
				else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			// CAUTION: Needed to parenthesize options.path and options.domain
			// in the following expressions, otherwise they evaluate to undefined
			// in the packed version for some reason...
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			// Set the cookie name=value;expires=;path=;domain=;secure-
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		}
		else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						// Get the cookie value
						try {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						}
						catch (e) {
							cookieValue = cookie.substring(name.length + 1);
						}
						break;
					}
				}
			}
			// Parse JSON from the cookie into an object
			if (jQuery.evalJSON && cookieValue && cookieValue.match(/^\s*\{/)) {
				try {
					cookieValue = jQuery.evalJSON(cookieValue);
				}
				catch (e) {
				}
			}
			return cookieValue;
		}
	};

	//can get url parameters by using fy.request["paramName"]
	fy.request = (function () {
		var ret = {}, a = window.location,
			seg = a.search.replace(/^\?/, '').split('&'),
			len = seg.length, i = 0, s;
		for (; i < len; i++) {
			if (!seg[i]) {
				continue;
			}
			s = seg[i].split('=');
			//ret[s[0]] = decodeURI(s[1]);
			try {
				ret[s[0]] = decodeURI(s[1]);
			}
			catch (e) {
				ret[s[0]] = s[1];
			}
		}
		return ret;
	})();

	/*  ---- padding left ----  */
	fy.padLeft = function (oStr, oLength, oPad) {
		var s = oStr.toString(),
			t = s.length,
			oSig = oPad || '0';
		if (oLength > t)
			s = new Array(oLength - t + 1).join(oSig.toString()) + s;
		return s;
	};


	fy.addSeconds = function (d, s) {
		return new Date(d.getTime() + s * 1000);
	};
	fy.addDays = function (d, s) {
		return new Date(d.getTime() + s * 24 * 3600 * 1000);
	};
	fy.daySpan = function (dateTo, dateFrom) {
		return Math.round((dateTo.valueOf() - dateFrom.valueOf()) / 86400000);
	};
	fy.weekSpan = function (dateTo, dateFrom) {
		var d = fy.daySpan(dateTo, dateFrom);
		return Math.ceil((d + dateFrom.getDay()) / 7);
	};

	fy.formatDate = function (date, formater) {
		var format = formater || 'yyyy-MM-dd'; // default format
		var o = {
			"M+": date.getMonth() + 1, //month   
			"d+": date.getDate(), //date
			"h+": (date.getHours()>12?date.getHours()-12:date.getHours()), //hour 12
			"H+": date.getHours(), //hour 24
			"m+": date.getMinutes(), //minute
			"s+": date.getSeconds(), //second   
			"q+": Math.floor((date.getMonth() + 3) / 3), //quarter   
			"S": date.getMilliseconds() //millisecond   
		};

		if (/(y+)/.test(format))
			format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

		for (var k in o)
			if (new RegExp("(" + k + ")").test(format))
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));

		return format;
	};

	fy.parseDate = function (str, formater) {
		var format = formater || 'yyyy-MM-dd HH:mm:ss'; // default format
		var parts = str.match(/(\d+)/g),
			i = 0,
			fmt = {};
		// extract date-part indexes from the format
		format.replace(/(yyyy|dd|MM|HH|hh|mm|ss)/g, function (part) {
			fmt[part] = i++;
		});
		//
		if(!fmt['HH'] && fmt['hh']) fmt['HH'] = fmt['hh'] ;

		return new Date(parts[fmt['yyyy']]||0, (parts[fmt['MM']]||1)-1 , parts[fmt['dd']]||0 , parts[fmt['HH']]||0, parts[fmt['mm']]||0, parts[fmt['ss']]||0);
	};

	//Json Date to String
	fy.parseJsonDate = function (str , format) {
		if(!str) return '' ;
		var d ;
		if(str.indexOf('/Date(')!=-1) {
			str = parseInt(str.substr(6) , 10);// + sys.timeZone * 60000 ;
			d = new Date(str) ;
		}
		else{
			d = new Date(Date.parse(str) + sys.timeZone * 60000) ;
		}
		return fy.formatDate(d, format) ;
	};

	//number formater
	var number_format = fy.formatNumber = function (number, decimals, dec_point, thousands_sep) {
		// * usage: fy.numberFormat(1234.5678, 2, '.', '');
		// * return: 1234.57     
		var n = number,
			c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
		var d = dec_point == undefined ? "." : dec_point;
		var t = thousands_sep == undefined ? "," : thousands_sep,
			s = n < 0 ? "-" : "";
		var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
			j = (j = i.length) > 3 ? j % 3 : 0;

		var v = s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
		return parseFloat(v, 10);
	};

	//file size formater
	fy.formatFilesize = function (filesize) {
		if (filesize >= 1073741824) {
			filesize = number_format(filesize / 1073741824, 2, '.', ',') + ' GB';
		}
		else if (filesize >= 1048576) {
			filesize = number_format(filesize / 1048576, 2, '.', '') + ' MB';
		}
		else if (filesize >= 1024) {
			filesize = number_format(filesize / 1024, 0) + ' KB';
		}
		else {
			//filesize = '< 1KB';
			filesize = number_format(filesize, 0) + ' bytes';
		}
		return filesize;
	};

	fy.timeStamp = function () {
		var n = new Date , f = new Date(2012, 11, 22);
		return (n.valueOf() - f.valueOf()).toString();
	};

	fy.random = function (len) {
		return (Math.random() * Math.random()).toString().substr(2, len || 9);
	};

	//Usage: fy.uuid()
	fy.uuid = (function () {
		var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		return function (len, radix) {
			var chars = CHARS,
				uuid = [];
			radix = radix || chars.length;

			if (len) {
				// Compact form
				for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
			} else {
				var r;
				uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
				uuid[14] = '4';

				// Fill in random data.  At i==19 set the high bits of clock sequence as
				for (var i = 0; i < 36; i++) {
					if (!uuid[i]) {
						r = 0 | Math.random() * 16;
						uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
					}
				}
			}

			return uuid.join('');
		};
	})();

	//tested not passed under webkit
	fy.convertImageToBase64 = function (img) {
		// Create an empty canvas element
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;

		// Copy the image contents to the canvas
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);

		// Get the data-URL formatted image
		// Firefox supports PNG and JPEG. You could check img.src to
		// guess the original format, but be aware the using "image/jpg"
		// will re-encode the image.
		var dataURL = canvas.toDataURL("image/png");
		//return $(img).replaceWith('<img src="'+dataURL+'" class="latex">') ;
		return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	};

	//preload an image
	fy.preloadImage = function (url, onLoad, onError) {
		var img = new Image();
		img.onload = function () {
			img.onload = null;
			if (typeof onLoad === "function") onLoad(img);
			img = null;
		};
		img.onerror = function () {
			img.onerror = null;
			img = null;
			if (typeof onError === "function") onError();
		};
		img.src = url;
	};

	//dynamically load a script or css
	fy.loadFile = function (filename, filetype, onLoad, onError) {
		onLoad = onLoad || fy.EMPTY_FN;
		onError = onError || fy.EMPTY_FN;
		var fileref;
		if (filetype === "js") {
			var ss = document.getElementsByTagName("script");
			for (i = 0; i < ss.length; i++) {
				if (ss[i].src && ss[i].src.indexOf(filename) != -1) {
					return onLoad();
				}
			}
			fileref = document.createElement('script');
			document.getElementsByTagName("head")[0].appendChild(fileref);
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", filename);
		}
		else if (filetype === "css") {
			if (document.createStyleSheet) {
				fileref = document.createStyleSheet(filename);
			}
			else {
				fileref = document.createElement("link");
				document.getElementsByTagName("head")[0].appendChild(fileref);
				fileref.setAttribute("rel", "stylesheet");
				fileref.setAttribute("type", "text/css");
				fileref.setAttribute("href", filename);
			}
		}

		fileref.onload = fileref.onreadystatechange = function () {
			if (this.readyState && this.readyState == "loading") return;
			onLoad();
			onLoad = null;
		};
		fileref.onerror = function () {
			document.getElementsByTagName("head")[0].removeChild(fileref);
			onError();
			onError = null;
		};
		return fileref;
	};

	//dynamically remove a script or css
	fy.removeFile = function (filename, filetype) {
		//determine element type to create nodelist from
		var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none";
		//determine corresponding attribute to test for
		var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none";
		var allsuspects = document.getElementsByTagName(targetelement);
		//search backwards within nodelist for matching elements to remove
		for (var i = allsuspects.length; i >= 0; i--) {
			//remove element by calling parentNode.removeChild()
			if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1) allsuspects[i].parentNode.removeChild(allsuspects[i]);
		}
	};

	fy.cache = function(key , value){
		if(!top.window['__CACHE__']) top.window['__CACHE__'] = {} ;
		var ch = top.window['__CACHE__'] ;
		if(typeof value !=='undefined'){
			ch[key] = value ;
		}
		return ch[key] ;
	} ;
	fy.removeCache = function(key){
		if(!top.window['__CACHE__']) return ;
		var ch = top.window['__CACHE__'] ;
		if(key) delete ch[key] ;
		else top.window['__CACHE__'] = {};
	} ;

	/*
	 *js HTML Encode
	 */
	fy.HTML = {
		clean : function(str){
			return $('<div>' + str + '</div>').text() ;
		} ,
		encode: function (html) {
			var temp = document.createElement("div");
			temp.innerText ? (temp.innerText = html) : (temp.textContent = html);
			var output = temp.innerHTML;
			temp = null;
			return output;
		},
		decode: function (html) {
			var temp = document.createElement("div");
			temp.innerHTML = html;
			var output = temp.innerText || temp.textContent;
			temp = null;
			return output;
		},
		//HTML des encode. (ascii)
		desEncode: function (str) {
			var res = [];
			for (var i = 0; i < str.length; i++)
				res[i] = str.charCodeAt(i);
			return "&#" + res.join(";&#") + ";";
		},
		//HTML hex encode.
		hexEncode: function (str) {
			var res = [];
			for (var i = 0; i < str.length; i++)
				res[i] = str.charCodeAt(i).toString(16);
			//return "&#" + String.fromCharCode(0x78) + res.join(";&#" + String.fromCharCode(0x78)) + ";";
			return "&#x" + res.join(";&#x") + ";";
		},
		//仅对双字节和&编码
		encodeSBC: function (s) {
			var r = "", c;
			for (var i = 0; i < s.length; i++) {
				c = s.charCodeAt(i);
				r += (c < 32 || c == 38 || c > 127) ? ("&#" + c + ";") : s.charAt(i);
			}
			return r;
		},
		//DES and HEX Decode 2in1
		desHexDecode: function (str) {
			return str.replace(/&#(x)?([^&]{1,5});?/g, function ($, $1, $2) {
				return String.fromCharCode(parseInt($2, $1 ? 16 : 10));
			});
		},
		//全半角转换
		/* *全角空格为12288，半角空格为32 *其他字符半角(33-126)与全角(65281-65374)的对应关系是：均相差65248 */
		//转半角
		toDBC: function (input) {
			var res = "", c;
			for (var i = 0; i < input.length; i++) {
				c = input.charCodeAt(i);
				if (c >= 0xFF01 && c <= 0xFF5E)
					res += String.fromCharCode(c - 0xFEE0);
				else if (c == 0x3000)
					res += String.fromCharCode(0x20);
				else
					res += input.charAt(i);
			}
			return res;
		},
		//转全角
		toSBC: function (input) {
			var res = "", c;
			for (var i = 0; i < input.length; i++) {
				c = input.charCodeAt(i);
				if (c >= 0x21 && c <= 0x7e)
					res += String.fromCharCode(c + 0xFEE0);
				else if (c == 0x20)
					res += String.fromCharCode(0x3000);
				else
					res += input.charAt(i);
			}
			return res;
		},
		toUTF8: function (str) {
			if (typeof( str ) !== "string") {
				throw new TypeError("toUTF8 function only accept a string as its parameter.");
			}
			var ret = [];
			var c1, c2, c3;
			var cc = 0;
			for (var i = 0, l = str.length; i < l; i++) {
				cc = str.charCodeAt(i);
				if (cc > 0xFFFF) {
					throw new Error("InvalidCharacterError");
				}
				if (cc > 0x80) {
					if (cc < 0x07FF) {
						c1 = String.fromCharCode(( cc >>> 6 ) | 0xC0);
						c2 = String.fromCharCode(( cc & 0x3F ) | 0x80);
						ret.push(c1, c2);
					} else {
						c1 = String.fromCharCode(( cc >>> 12 ) | 0xE0);
						c2 = String.fromCharCode(( ( cc >>> 6 ) & 0x3F ) | 0x80);
						c3 = String.fromCharCode(( cc & 0x3F ) | 0x80);
						ret.push(c1, c2, c3);
					}
				} else {
					ret.push(str[i]);
				}
			}
			return ret.join('');
		},
		fromUTF8: function (str) {
			if (typeof( str ) !== "string") {
				throw new TypeError("fromUTF8 function only accept a string as its parameter.");
			}
			if (/[^\x20-\xEF]/.test(str)) {
				throw new Error("InvalidCharacterError");
			}
			var ret = [];
			var cc = 0;
			var ct = 0;
			for (var i = 0, l = str.length; i < l;) {
				cc = str.charCodeAt(i++);
				if (cc > 0xE0) {
					ct = ( cc & 0x0F ) << 12;
					cc = str.charCodeAt(i++);
					ct |= ( cc & 0x3F ) << 6;
					cc = str.charCodeAt(i++);
					ct |= cc & 0x3F;
					ret.push(String.fromCharCode(ct));
				} else if (cc > 0xC0) {
					ct = ( cc & 0x1F ) << 6;
					cc = str.charCodeAt(i++);
					ct |= ( cc & 0x3F ) << 6;
					ret.push(String.fromCharCode(ct));
				} else if (cc > 0x80) {
					//throw new Error("InvalidCharacterError");
				} else {
					ret.push(str[i]);
				}
			}
			return ret.join('');
		}
	};

	fy.printIframe = function(iframeWin){
		if(fy.browser.msie) {
			iframeWin.document.execCommand('print', false, null);
		}
		else{
			iframeWin.print();
		}
	};

	/*
	 fy.util.validate  数据校验
	 */

	var Validate = {};
	Validate.isset = function (string) {
		return !!string;
	};
	Validate.empty = function (string) {
		return String(string).replace(/\s+/g, '').length == 0;
	};
	Validate.required = function (str) {
		return !Validate.empty(str);
	};
	Validate.email = function (string) {
		return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(string);
	};
	Validate.url = function (string) {
		return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i.test(string);
	};
	Validate.date = function (string, preutc) {
		var date = Date.parse(string);
		if (isFinite(date)) {
			return true;
		}
		if (preutc) {
			var now = new Date();
			string = string.replace(/\d{4}/, now.getFullYear());
			date = Date.parse(string);
			return isFinite(date);
		}
		return false;
	};
	Validate.time = function (string) {
		var checkValue = new RegExp("^/[0-2]{1}/[0-6]{1}:/[0-5]{1}/[0-9]{1}:/[0-5]{1}/[0-9]{1}");
		return checkValue.test(string);
	}
	Validate.zip = function (string, plus4) {
		var pattern = plus4 ? /^\d{5}-\d{4}$/ : /^\d{5}$/;
		return pattern.test(string);
	};
	Validate.phone = function (string) {
		return /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(string);
	};
	Validate.integer = function (string) {
		return /^\-?\d+$/.test(string);
	};
	Validate.numeric = function (string) {
		return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(string);
	};
	Validate.currency = function (string, us) {
		return /^\$-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(string);
	};
	Validate.ip = function (string) {
		return /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/.test(string);
	};
	Validate.ssn = function (string) {
		return /^\d{3}-\d{2}-\d{4}$/.test(string);
	};
	Validate.tin = function (string) {
		return /^\d{2}-\d{7}$/.test(string);
	};
	Validate.base64 = function (string) {
		return /[^a-zA-Z0-9\/\+=]/i.test(string);
	};
	Validate.alpha = function (string) {
		return /^[a-z]$/i.test(string);
	};
	Validate.alphaNumeric = function (string) {
		return /^[a-z0-9]$/i.test(string);
	};
	Validate.lowercase = function (string) {
		return string.toLowerCase() == string;
	};
	Validate.uppercase = function (string) {
		return string.toUpperCase() == string;
	};
	Validate.minlength = function (string, length) {
		return string.length >= length;
	};
	Validate.maxlength = function (string, length) {
		return string.length <= length;
	};
	Validate.between = function (string, min, max) {
		return string.length >= min && string.length <= max;
	};
	//Expose to fy
	fy.validates = Validate;


	//sort objective array on an attribute
	fy.sortOn = function (arr, prop, sortCompareFunction) {
		if (sortCompareFunction && typeof sortCompareFunction === 'function')
			return arr.sort(sortCompareFunction);

		else {
			var dup = Array.prototype.slice.call(arr, 0);
			//var dup = arr.slice(0);
			if (!arguments.length) return dup.sort();
			//var args = Array.prototype.slice.call(arguments);
			return dup.sort(
				function (a, b) {
					var A = a[prop] , nA = isNaN(A) , B = b[prop] , nB = isNaN(B);
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
	};

	// Here's a more flexible version, which allows you to create
	// reusable sort functions, and sort by any field
	// Sort by price high to low
	//homes.sort(sort_by('price', true, parseInt));
	// Sort by city, case-insensitive, A-Z
	//homes.sort(sort_by('city', false, function(a){return a.toUpperCase()}));
	/*
	 var sort_by = function(field, reverse, primer){

	 var key = function (x) {return primer ? primer(x[field]) : x[field]};

	 return function (a,b) {
	 var A = key(a), B = key(b);
	 return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];
	 }
	 }
	 */

	//fy.is.Array([]) .or: fy.is.Date(new Date())
	fy.is = {
		types: ["Array", "RegExp", "Date", "Number", "String", "Object", "HTMLDocument"]
	};
	for (var i = 0, c; c = fy.is.types[i++];) {
		fy.is[c] = (function (type) {
			return function (obj) {
				return Object.prototype.toString.call(obj) == "[object " + type + "]";
			}
		})(c);
	}


	//Language Package sets
	fy.setLanguage = function (languagePack, strId) {
		var elem , document = window.document;
		if (strId === undefined) {
			var key;
			for (key in languagePack) {
				var x = key.indexOf("::");
				if (x !== -1) {
					var id = key.substr(0, x) , tag = key.substr(x + 2);
					elem = $(tag, "#" + id);
					for (var f = 0, g = elem.length; f < g; f++) {
						var el = elem[f];
						//$(el).html(textObj[key][f]) ;
						el.innerText ? (el.innerText = languagePack[key][f]) : (el.textContent = languagePack[key][f]);
					}
				}
				else {
					x = key.indexOf("@");
					if (x > -1) {
						var id = key.substr(0, x) , attr = key.substr(++x);
						$("#" + id).attr(attr, languagePack[key]);
					}
					else {
						elem = document.getElementById(key);
						if (elem) $(elem).html(languagePack[key]);
					}
				}

			}
		} else {
			var tId;
			for (var i = 1, l = arguments.length; i < l; i++) {
				tId = arguments[i];
				elem = document.getElementById(tId);
				if (elem && languagePack[tId]) $(elem).html(languagePack[tId]);
			}
		}
		return fy;
	};


	//sim thread to void long-time-calculate locking
	fy.thread = function (arr, param) {
		var def = {
			startIndex: 0,
			caller: window,
			itemRender: null,
			stepLength: 5000,
			onStart: null,
			onProgress: null,
			onComplete: null
		};
		var sets = $.extend(def, param);
		var processor = sets.itemRender  , num = arr.length , timer = 0 , cur = 0;

		//var fn = function(){handler(cur, sets.stepLength) ;};

		if (sets.onStart) sets.onStart.call(sets.caller, arr);
		handler(sets.startIndex, sets.stepLength);

		function handler() {
			var p = processor || false , that = sets.caller , stepLength = sets.stepLength;
			if (sets.onProgress) sets.onProgress.call(that, cur, arr);
			for (var i = 0; i < stepLength; i++) {
				if (cur === num) {
					if (sets.onComplete) sets.onComplete.call(that, arr);
					sets = processor = arr = cur = stepLength = p = that = null;
					return;
				}
				else {
					++cur;
					if (p) p.call(that, cur, arr[cur], arr);
				}
			}

			timer = setTimeout(handler, 0);
		}
	};


	//benchmark for javascript function testing
	fy.benchMark = function (fn, _loopTimes, _testTimes) {
		var loopTimes = _loopTimes || 5000 ,
			testTimes = _testTimes || 1;
		if (testTimes === 1) return test();
		else {
			var t = 0;
			for (var x = 0; x < testTimes; x++) t += test();
			return t / testTimes;
		}

		function test() {
			var t1 = new Date , i = 0;
			for (; i < loopTimes; i++) fn();
			return ((new Date).getTime() - t1.getTime());
		}
	};

	//Parameters:
	//check      : a function to return true/false
	//proc       : a function which won't run until check() return true
	//chkInterval: optional, checking interval, default value is 500ms
	fy.delayExecute = function (check, proc, chkInterval) {
		//default interval = 100ms
		var x = chkInterval || 100;
		var hnd = window.setInterval(function () {
			//if check() return true,
			//stop timer and execute proc()
			if (check()) {
				window.clearInterval(hnd);
				proc();
			}
		}, x);
	};

	//handle some timer into one trigger
	fy.timerManager = {
		interval: 0,
		timer: {},
		has: function (id) {
			return (id in this.timer);
		},
		once: function (cfg) {
			if (this.timer[cfg.id]) throw new Error("id conflict");
			cfg[':stamp'] = (new Date).getTime();
			cfg[':once'] = true;
			this.timer[cfg.id] = cfg;
			return this;
		},
		add: function (cfg) {
			if (this.timer[cfg.id]) throw new Error("id conflict");
			cfg[':stamp'] = (new Date).getTime();
			this.timer[cfg.id] = cfg;
			return this;
		},
		remove: function (tar) {
			var id;
			if (typeof tar === "string") id = tar;
			else if (tar.id) id = tar.id;

			if (this.timer[id]) delete this.timer[id];
			return this;
		},
		trigger: function () {
			var tm = fy.timerManager.timer  , key , act , now = (new Date).getTime();
			for (key in tm) {
				act = tm[key];
				if (now - act[':stamp'] >= act.timeOut) {
					act[':stamp'] = now;
					act.fn();
					if (act[':once']) this.remove(cfg.id);
				}
			}
			return this;
		},
		run: function (timeSpan) {
			if (this.interval) this.stop();
			this.interval = setInterval(fy.timerManager.trigger, timeSpan || 1000);
			return this;
		},
		stop: function () {
			if (this.interval) {
				clearInterval(this.interval);
				this.interval = 0;
			}
			return this;
		}
	};


	var pfx = ["" , "webkit", "ms", "moz", "o"];
	fy.runPrefixMethod = function (obj, method) {
		var p = 0, m, t;
		while (p < pfx.length && !obj[m]) {
			m = method;
			if (pfx[p] === "") {
				m = m.substr(0, 1).toLowerCase() + m.substr(1);
			}
			m = pfx[p] + m;
			t = typeof obj[m];
			if (t != "undefined") {
				pfx = [pfx[p]];
				return (t === "function" ? obj[m]() : obj[m]);
			}
			p++;
		}
		return false;
	};

	var TAGNAMES = {//特定元素上的特定事件
		'select': 'input', 'change': 'input',
		'submit': 'form', 'reset': 'form',
		'error': 'img', 'load': 'img', 'abort': 'img'
	};

	fy.isEventSupported = function isEventSupported(eventName, element) {
		element = element || document.createElement(TAGNAMES[eventName] || 'div');
		eventName = 'on' + eventName;

		// When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
		var isSupported = (eventName in element);//DOM0

		if (!isSupported) {
			// if it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
			if (!element.setAttribute) {
				element = document.createElement('div');
			}
			if (element.setAttribute && element.removeAttribute) {
				element.setAttribute(eventName, '');
				isSupported = typeof element[eventName] == 'function';

				// if property was created, "remove it" (by setting value to `undefined`)
				if (typeof element[eventName] != 'undefined') {
					element[eventName] = void 0;
				}
				element.removeAttribute(eventName);
			}
		}

		element = null;
		return isSupported;
	};

	// 由于jQuery 1.9 开始取消了jQuery.browser 类，故在此加回浏览器测试功能
	// 判断某种浏览器用if(fy.browser.msie)或if(fy.browser.firefox)等形式，
	// 而判断浏览器版本只需用if(fy.browser.msie == 8)或if(fy.browser.firefox == 3)等形式
	// 也可用 fy.browser.name 获取名称; fy.browser.version 取得版本
	// based on https://github.com/gabceb/jquery-browser-plugin
	var matched = (function (ua) {
		ua = ua.toLowerCase();

		var match = /(opr)[\/]([\w.]+)/.exec(ua) ||
			/(chrome)[ \/]([\w.]+)/.exec(ua) ||
			/(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
			/(webkit)[ \/]([\w.]+)/.exec(ua) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
			/(msie) ([\w.]+)/.exec(ua) ||
			ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec(ua) ||
			ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
			[];

		var platform_match = /(ipad)/.exec(ua) ||
			/(iphone)/.exec(ua) ||
			/(android)/.exec(ua) ||
			/(windows phone)/.exec(ua) ||
			/(win)/.exec(ua) ||
			/(mac)/.exec(ua) ||
			/(linux)/.exec(ua) ||
			/(cros)/i.exec(ua) ||
			[];

		return {
			browser: match[ 3 ] || match[ 1 ] || "",
			version: match[ 2 ] || "0",
			platform: platform_match[0] || ""
		};
	})(window.navigator.userAgent);

	var browser = {};

	if (matched.browser) {
		browser[ matched.browser ] = true;
		browser.version = matched.version;
		browser.versionNumber = parseInt(matched.version, 10);
	}

	if (matched.platform) {
		browser[ matched.platform ] = true
	}

	// These are all considered mobile platforms, meaning they run a mobile browser
	if ( browser.android || browser.ipad || browser.iphone || browser[ "windows phone" ] ) {
		browser.mobile = true;
	}

	// These are all considered desktop platforms, meaning they run a desktop browser
	if ( browser.cros || browser.mac || browser.linux || browser.win ) {
		browser.desktop = true;
	}

	// Chrome, Opera 15+ and Safari are webkit based browsers
	if (browser.chrome || browser.opr || browser.safari) {
		browser.webkit = true;
	}

	// IE11 has a new token so we will assign it msie to avoid breaking changes
	if (browser.rv) {
		var ie = 'msie';
		matched.browser = ie;
		browser[ie] = true;
	}

	// Opera 15+ are identified as opr
	if (browser.opr) {
		var opera = 'opera';
		matched.browser = opera;
		browser[opera] = true;
	}

	// Stock Android browsers are marked as Safari on Android.
	if (browser.safari && browser.android) {
		var android = "android";

		matched.browser = android;
		browser[android] = true;
	}

	// Assign the name and platform variable
	browser.name = matched.browser;
	browser.platform = matched.platform;


	//是否触摸屏 added by Lyu Pengfei
	browser.touchable = fy.isEventSupported('touchstart', document);

	fy.browser = browser;

	//replace into jQuery
	$.browser = fy.browser;


	//
	fy.deepClone = function (sObj) {
		//if(typeof sObj !== "object") return sObj;
		/*var s = sObj.constructor === Array ? []:{} ;
		 for(var i in sObj) s[i] = fy.deepClone(sObj[i]);
		 return s;*/
		return JSON.parse(JSON.stringify(sObj));
		//return (Object.clone)?Object.clone(sObj) : (sObj.constructor === Array ? sobj.slice(0) : jQuery.extend(true, {}, sObj) ) ;
	};

	//
	fy.select = function (element) {
		var range;
		if (fy.browser.msie) {
			if (element.createTextRange) {
				range = element.createTextRange();
			}
			else {
				range = document.body.createTextRange();
				range.collapse();
				range.moveToElementText(element);
			}
			range.moveEnd('character', 0);
			range.moveStart('character', -1);
			range.select();
		}
		else {
			if (element.setSelectionRange) {
				element.focus();
				//element.setSelectionRange(0 , -1);
				element.select();
			}
			else {
				var selection = window.getSelection();
				selection.setBaseAndExtent(element, 0, element, 1);
			}
		}
	};


	fy.cutChars = function (str, len) {
		var oLen = str.length;
		if (oLen * 2 <= len) {
			return str;
		}
		for (var i = 0 , charLen = 0; i < oLen; i++) {
			if (str.charCodeAt(i) > 256) {
				charLen += 2;
				if (charLen > len) {
					return str.substring(0, i - 1) + "…";
				}
			}
			else {
				charLen++;
				if (charLen > len) {
					return str.substring(0, i - 2) + "…";
				}
			}
		}
		return str;
	};


	//修正浮点数计算误差
	fy.calc = {
		/*
		 函数，加法函数，用来得到精确的加法结果
		 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
		 参数：arg1：第一个加数；arg2第二个加数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数）
		 返回值：两数相加的结果
		 */
		add: function (arg1, arg2) {
			arg1 = arg1.toString(), arg2 = arg2.toString();
			var arg1Arr = arg1.split("."), arg2Arr = arg2.split("."), d1 = arg1Arr.length == 2 ? arg1Arr[1] : "", d2 = arg2Arr.length == 2 ? arg2Arr[1] : "";
			var maxLen = Math.max(d1.length, d2.length);
			var m = Math.pow(10, maxLen);
			var result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen));
			var d = arguments[2];
			return typeof d === "number" ? Number((result).toFixed(d)) : result;
		},
		/*
		 函数：减法函数，用来得到精确的减法结果
		 说明：函数返回较为精确的减法结果。
		 参数：arg1：第一个加数；arg2第二个加数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数
		 返回值：两数相减的结果
		 */
		sub: function (arg1, arg2) {
			return fy.calc.add(arg1, -Number(arg2), arguments[2]);
		},
		/*
		 函数：乘法函数，用来得到精确的乘法结果
		 说明：函数返回较为精确的乘法结果。
		 参数：arg1：第一个乘数；arg2第二个乘数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数)
		 返回值：两数相乘的结果
		 */
		mul: function (arg1, arg2) {
			var r1 = arg1.toString(), r2 = arg2.toString(), m, resultVal, d = arguments[2];
			m = (r1.split(".")[1] ? r1.split(".")[1].length : 0) + (r2.split(".")[1] ? r2.split(".")[1].length : 0);
			resultVal = Number(r1.replace(".", "")) * Number(r2.replace(".", "")) / Math.pow(10, m);
			return typeof d !== "number" ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)));
		},
		/*
		 函数：除法函数，用来得到精确的除法结果
		 说明：函数返回较为精确的除法结果。
		 参数：arg1：除数；arg2被除数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数)
		 返回值：arg1除于arg2的结果
		 */
		div: function (arg1, arg2) {
			var r1 = arg1.toString(), r2 = arg2.toString(), m, resultVal, d = arguments[2];
			m = (r2.split(".")[1] ? r2.split(".")[1].length : 0) - (r1.split(".")[1] ? r1.split(".")[1].length : 0);
			resultVal = Number(r1.replace(".", "")) / Number(r2.replace(".", "")) * Math.pow(10, m);
			return typeof d !== "number" ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)));
		} ,
		/*
		百分比，返回带%
		*/
		percent : function(p ,all , d){
			d = (typeof d === 'undefined')?1:d ;
			if(all==0) return 'NaN%';
			return Number(Math.round(p/all*10000)/100).toFixed(d)+'%' ;
		}
	};

	//http://www.paulfree.com/28/javascript-array-filtering/
	/*Array.prototype.where = function (f) {
	 var fn = f;
	 // if type of parameter is string
	 if (typeof f == "string")
	 // try to make it into a function
	 if (( fn = lambda(fn) ) == null)
	 // if fail, throw exception
	 throw "Syntax error in lambda string: " + f;

	 // initialize result array
	 var res = [];
	 var l = this.length;
	 // set up parameters for filter function call
	 var p = [ 0, 0, res ];
	 // append any pass-through parameters to parameter array
	 for (var i = 1; i < arguments.length; i++) p.push(arguments[i]);
	 // for each array element, pass to filter function
	 for (i = 0; i < l; i++) {
	 // skip missing elements
	 if (typeof this[ i ] == "undefined") continue;
	 // param1 = array element
	 p[ 0 ] = this[ i ];
	 // param2 = current indeex
	 p[ 1 ] = i;
	 // call filter function. if return true, copy element to results
	 if (!!fn.apply(this, p)) res.push(this[i]);
	 }
	 // return filtered result
	 return res;
	 };*/

	/*
	 //var x = 3..n(5);
	 //alert(x);
	 Number.prototype.n = function (n) {
	 for(var i = +this, a = []; i <= n;) a.push(i++);
	 return a;
	 };*/

	/*
	 fy.adjustIframe = function (id) {
	 var iframe = document.getElementById(id)
	 var idoc = iframe.contentWindow && iframe.contentWindow.document || iframe.contentDocument;
	 var callback = function () {
	 var iheight = Math.max(idoc.body.scrollHeight, idoc.documentElement.scrollHeight); //取得其高
	 iframe.style.height = iheight + "px";
	 }
	 if (iframe.attachEvent) {
	 iframe.attachEvent("onload", callback);
	 } else {
	 iframe.onload = callback
	 }
	 }
	 */


	/*
	 //IE9+ has array.indexOf
	 if (!Array.prototype.indexOf) {
	 Array.prototype.indexOf = function (searchElement, fromIndex) {
	 if ( this === undefined || this === null ) {
	 throw new TypeError( '"this" is null or not defined' );
	 }

	 var length = this.length >>> 0; // Hack to convert object.length to a UInt32

	 fromIndex = +fromIndex || 0;

	 if (Math.abs(fromIndex) === Infinity) {
	 fromIndex = 0;
	 }

	 if (fromIndex < 0) {
	 fromIndex += length;
	 if (fromIndex < 0) {
	 fromIndex = 0;
	 }
	 }

	 for (;fromIndex < length; fromIndex++) {
	 if (this[fromIndex] === searchElement) {
	 return fromIndex;
	 }
	 }

	 return -1;
	 };
	 }
	 */
})(window, jQuery, fy);

