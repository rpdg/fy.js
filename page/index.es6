import store from '/es6/util/store';
import {ops, $} from '/es6/ops';

store.set('apiServer', window.apiServer);

ops.api({
	'login!post': 'system/user/login'
});

ops.api.login.set('codes', {
	/*identification_orgcode_empty: '用户所属组织代码为空',
	 identification_loginname_empty: '登录名为空',
	 identification_passwod_empty: '密码为空',*/
	identification_failure: '登录验证失败'
});



/*if (store.get('X-Token')) {
 //window.location.href = mainPage;
 }
 else {*/


$('#btnLogin').click(function () {

	var param = $('#loginForm').fieldsToJson();

	if (!param.orgCode) {
		$('#orgCode').iptError('组织代码不能为空');
	}
	else if (!param.loginName) {
		$('#loginName').iptError("用户名不能为空");
	}
	else if (!param.password) {
		$('#password').iptError("密码不能为空");
	}


	else {
		ops.api.login(param, function (data) {
			store.set('X-Token', data.token);
			store.set('userInfo', data.userInfo);
			store.set('permissons', data.permissons);

			window.location.href = mainPage;
		});
	}

});
//}