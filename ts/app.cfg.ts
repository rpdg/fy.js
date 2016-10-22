import ops from "./ops";
import store from 'ts/util/store';

store.use('sessionStorage');

var cfg: any = {};

//noinspection TypeScriptUnresolvedVariable
cfg.apiServer = store.get('apiServer') || (window.CONFIG ? window.CONFIG.apiServer : null);

cfg.ajaxTimeOut = 20000;

cfg.loginPage = '/page/index.html';

cfg.version = 'beta version';


cfg.onUnauthorizedError = function () {
	var param = '', url = cfg.loginPage;
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

cfg.onServerError = function (errorMsg) {
	//console.log(this);
	errorMsg = errorMsg || 'unknown error';

	if (errorMsg === 'token_exception' && location.pathname != cfg.loginPage) {
		cfg.onUnauthorizedError();
	}

	if (this.codes && this.codes[errorMsg]) {
		errorMsg = this.codes[errorMsg];
	}
	else if (globalErrorCodes[errorMsg]) {
		errorMsg = globalErrorCodes[errorMsg];
	}

	ops.err(errorMsg);
};


export default cfg;


