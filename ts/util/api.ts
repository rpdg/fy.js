import cfg from '../app.cfg.ts';
import store from "./store.ts";
import {format} from '../util/utils.ts';


interface AjaxMeta {
	success ?: boolean,
	message: string
}
interface AjaxMessage {
	data ?: any ,
	meta: AjaxMeta
}
interface ApiCall extends Function {
	set(key: string, value: any): ApiCall ;
	get(key: string): any
}
//noinspection TypeScriptUnresolvedVariable
//cfg.apiServer = window.apiServer ;

if (!cfg.apiServer) {
	cfg.onUnauthorizedError();
}

var onServerError = cfg.onServerError || function (msg) {
		alert("err: " + msg);
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
	var token = store.get('X-Token');
	if (token) {
		return {'X-Token': token};
	}
	else {
		if (window.location.pathname != cfg.loginPage) {
			cfg.onUnauthorizedError();
		}
		return null;
	}
})();

const defaultErrorMsg: AjaxMessage = {message: 'Server echoes without meta data'} as AjaxMessage;


class ServerFn {

	name: string;
	method: string;
	restful: boolean;
	url: string;

	unlimited: boolean;
	accessible: boolean;

	onError?: Function;


	constructor(url: string, name: string, method = 'GET', restful = true) {

		this.name = name;
		this.method = method;
		this.restful = restful;

		if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) this.url = url;
		else this.url = cfg.apiServer + url.replace(/^\//, '');


		this.unlimited = false;
		this.accessible = true;

	}

	handleError(error, callback) {
		if (typeof this.onError === 'function')
			return this.onError.call(this, error, callback);
		else
			return onServerError.call(this, error, callback);
	}

	invoke(data, callback): JQueryXHR {
		var that = this;

		if (this.accessible || this.unlimited) {
			this.accessible = false;
			//return $[this.method].apply(this, makeParam.call(this, data, callback, type || 'json'));
			if ($.isFunction(data)) {
				callback = data;
				data = null;
			}

			var url = this.url;

			if (data) {
				if (!this.restful && this.method != 'GET') {
					data = JSON.stringify(data);
				}
				else if (this.restful) {
					url = format.json(url, data);
					data = null;
				}
			}


			return $.ajax({
				headers: xToken,
				url: url,
				data: data,
				method: this.method,
				dataType: "json",
				contentType: "application/json",
				cache: false,
				timeout: cfg.ajaxTimeOut,
				beforeSend: function (jqXHR: JQueryXHR, settings: JQueryAjaxSettings) {
					loading.handlers++;

					if (loading.timer) clearTimeout(loading.timer);
					loading.timer = 0;
					loading.show();

				},
				complete: function () {
					loading.handlers--;
					loading.timer = setTimeout(loading.hide, 100);

					that.accessible = true;
					that = null;

					return data;
				},
				error: function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
					if (jqXHR.responseJSON && jqXHR.responseJSON.meta && jqXHR.responseJSON.meta.message) {
						that.handleError.call(that, jqXHR.responseJSON.meta.message, callback);
					}
					else {
						var code = jqXHR.status;
						that.handleError.call(that, 'api.' + that.name + ' error ' + code + ' (' + errorThrown + ')');
					}

				},
				success: function (json: AjaxMessage, textStatus: string, jqXHR: JQueryXHR) {

					var meta = json.meta || defaultErrorMsg;

					if (meta.success) {
						if (callback && typeof callback === 'function')
							callback(json.data, textStatus, jqXHR);
					}
					else {
						that.handleError.call(that, meta.message, callback);
					}
				}
			});

		}
		else {
			throw new Error('Server function unusable now.');
		}
	}
}


var api = function (apiSet: Map<string>) {

	for (let key: string in apiSet) {
		let uArr = key.split('!');
		let pName = uArr[0];
		let pMethod = uArr[1] ? uArr[1].toString().toUpperCase() : 'GET';
		let restful = (!(uArr[2] === undefined)) || (apiSet[key].indexOf('${') > -1);

		if (!api[pName]) {
			api[pName] = (function (srvFn: ServerFn) {

				let fn: ApiCall = <ApiCall> function (data, callback) {
					return srvFn.invoke.call(srvFn, data, callback);
				};

				fn.set = (k, v) => {
					srvFn[k] = v;
					return fn;
				};

				fn.get = (k:string) => srvFn[k];

				fn.toString = ()=> srvFn.url;

				/*fn.post = (data , cb)=>{
				 fn.set('method' , 'POST') ;
				 return fn(data , cb);
				 };*/


				return fn;
			})(new ServerFn(apiSet[key], pName, pMethod, restful));
		}
		else {
			throw new Error('api [' + pName + '] duplicate definition');
		}
	}

	return api;
};


export {api, AjaxMessage} ;