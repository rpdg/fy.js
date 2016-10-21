import store from 'ts/util/store.ts';
import ops from 'ts/ops.ts';

//noinspection TypeScriptUnresolvedVariable
store.set('apiServer', window.CONFIG.apiServer);

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

	var param = $('#loginForm').fieldsToJson({
		orgCode: {}
	});

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
			if (data.permissons && data.permissons.length) {
				store.set('X-Token', data.token);
				store.set('userInfo', data.userInfo);
				store.set('permissons', data.permissons);

				var url = '/page/main.html' , hash = ops.request['returnUrl'];
				if (hash) {
					url += hash ;
				}
				window.location.href = url;
			}
			else {
				ops.err('账户没有权限');
			}
		});
	}

});

/*
 //noinspection TypeScriptUnresolvedVariable
 if(window.env === 'test'){

 }*/
