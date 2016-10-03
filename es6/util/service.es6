import {$} from '/es6/util/jquery.plugins';
import cfg from 'cfg';
import {uuid} from '/es6/util/uuid';
import store from '/es6/util/store';

var onServerError = cfg.onServerError || function (msg) {
		alert(msg);
	};

var loading = {
	dom: $('#opsAjaxLoading'),
	handlers: 0,
	timer: 0,
	show: function () {
		loading.dom.stop(true, true).fadeIn();
	},
	hide: function () {
		if (!loading.handlers)
			loading.dom.stop(true, true).fadeOut();
	}
};


const xToken = (function () {
	var token = store.get('x-token');
	if (token) {
		return {'X-Token': token};
	}
	else {
		if (window.location.pathname != '/' && window.location.pathname != 'index.html') {
			window.location.href = '/';
		}
		return null;
	}
})();

class ServerFn {

	constructor(url, name, method) {

		this.name = name;
		this.method = method || 'GET';

		if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) this.url = url;
		else this.url = cfg.apiServer + url.replace(/^['/']/, '');


		this.unlimited = false;
		this.accessable = true;

	}

	handleError(error, callback) {
		if (typeof this.onError === 'function')
			return this.onError.call(this, error, callback);
		else
			return onServerError.call(this, error, callback);
	}

	invoke(data, callback) {
		var that = this;

		if (this.accessable || this.unlimited) {
			this.accessable = false;
			//return $[this.method].apply(this, makeParam.call(this, data, callback, type || 'json'));
			if ($.isFunction(data)) {
				callback = data;
				data = null;
			}

			return $.ajax({
				headers: xToken,
				url: this.url,
				data: data,
				method: this.method,
				dataType: "json",
				cache: false,
				timeout: cfg.ajaxTimeOut,
				beforeSend: function (jqXHR, settings) {
					loading.handlers++;

					if (loading.timer) clearTimeout(loading.timer);
					loading.timer = 0;
					loading.show();

				},
				dataFilter: function (str) {
					that.accessable = true;
					return str;
				},
				complete: function () {
					loading.handlers--;
					loading.timer = setTimeout(loading.hide, 100);

					that = null;
				},
				error: function (jqXHR, textStatus, errorThrown) {

					var code = jqXHR.status,
						msg = errorThrown.message || errorThrown.toString() || '未知错误';

					that.handleError.call(that, 'api.' + that.name + ' error ' + code + ' (' + msg + ')');

				},
				success: function (json, statusText, xhr) {

					if (json.error) {
						that.handleError.call(that, json.error, callback);
					}
					else if (callback && typeof callback === 'function') {
						callback(json, statusText, xhr);
					}
				}
			});

		}
		else {
			throw new Error('Server function unusable now, may be you should set property "unlimited" to true.');
		}
	}
}


var api = function (obj) {

	for (let key in obj) {
		let uArr = key.split('!');
		let pName = uArr[0];
		let pMethod = uArr[1] ? uArr[1].toString().toUpperCase() : 'GET';


		if (!api[pName]) {
			api[pName] = (function (srvFn) {

				let fn = (data, callback) => srvFn.invoke.call(srvFn, data, callback);

				fn.set = (k, v) => {
					srvFn[k] = v;
					return fn;
				};

				fn.get = (k) => srvFn[k];

				fn.toString = ()=> srvFn.url;

				/*fn.post = (data , cb)=>{
				 fn.set('method' , 'POST') ;
				 return fn(data , cb);
				 };*/


				return fn;
			})(new ServerFn(obj[key], pName, pMethod));
		}
		else {
			throw new Error('api [' + pName + '] duplicate definition');
		}
	}

	return api;
};


export {api} ;