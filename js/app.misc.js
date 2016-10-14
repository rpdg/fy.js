

exports.ajaxTimeOut = 3000;

exports.loginPage = '<%=loginPage%>';

exports.onUnauthorizedError = function () {
	top.window.location.href = exports.loginPage;
};


var globalErrorCodes = {
	exception: '服务器内部错误'
};

exports.onServerError = function (errorMsg) {
	//console.log(this);
	errorMsg = errorMsg || 'unknown error';

	if (errorMsg === 'token_exception' && location.pathname != exports.loginPage) {
		exports.onUnauthorizedError();
	}

	if (this.codes && this.codes[errorMsg]) {
		errorMsg = this.codes[errorMsg];
	}
	else if (globalErrorCodes[errorMsg]) {
		errorMsg = globalErrorCodes[errorMsg];
	}

	ops.err(errorMsg);
};

exports.version = '<%=currentVersion%>';