exports.apiServer = '<%=apiServer%>';
exports.ajaxTimeOut = 3000;
exports.onServerError = function (error, callback) {
	ops.alert(error || 'unknown error');
};