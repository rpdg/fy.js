import opg from "./opg";
import {store} from 'ts/util/store';

store.use('sessionStorage');

interface IConfig {
	apiServer: string ;
	ajaxTimeOut: number;
	loginPage: string;
	version: string;
	onServerError?: Function;
	onUnauthorizedError?:Function;
}

let cfg: IConfig = {
	apiServer: store.get('apiServer') || (window.CONFIG ? window.CONFIG.apiServer : null),
	ajaxTimeOut: 30000,
	loginPage: '/page/index.html',
	version: '6.7.3_20171117',
};

cfg.onUnauthorizedError = function () {
	let param = '', url = cfg.loginPage;
	if (top.window.location.hash) {
		param = '?returnUrl=' + encodeURIComponent(top.window.location.hash);
		url += param;
	}
	top.window.location.href = url;
};


const globalErrorCodes = {
	'exception': '服务器内部错误',
	'delete_failure': '删除失败',
	'add_failure': '新增失败',
	'update_failure': '更新失败',
	'query_failure': '查询失败',
	'max_length': '输入超出最大长度',
	'token_exception': 'token验证失败',
};


cfg.onServerError = function (errorMsg: string = 'unknown error') {
	//console.log(this);

	if ((errorMsg === 'token_exception' || errorMsg === 'Token验证失败') && location.pathname != cfg.loginPage) {
		cfg.onUnauthorizedError();
	}

	if (this.codes && this.codes[errorMsg]) {
		errorMsg = this.codes[errorMsg];
	}
	else if (globalErrorCodes[errorMsg]) {
		errorMsg = globalErrorCodes[errorMsg];
	}
	/*else {
	 errorMsg = '服务端发生错误';
	 }*/

	top.opg.err(errorMsg);
};


export default cfg;


