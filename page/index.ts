import {store} from 'ts/util/store.ts';
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

let form = $('#loginForm');

let btnLogin = $('#btnLogin').click(function () {

	let param = form.fieldsToJson({
		orgCode: {
			name: '组织代码',
			require: true
		},
		loginName: {
			name: '用户名',
			require: true
		},
		password: {
			name: '密码',
			require: true
		}
	});

	if (param) {
		ops.api.login(param, function (data) {
			if (data.permissons && data.permissons.length) {

				store.set('X-Token', data.token);
				store.set('userInfo', data.userInfo);
				store.set('permissons', data.permissons);

				let url = '/page/main.html';

				let previousUser = store.get('userInfo');
				if (previousUser) {
					let previousLoginName = previousUser.loginName;
					if (previousLoginName === param.loginName) {
						let hash = ops.request['returnUrl'];
						if (hash) {
							url += hash;
						}
					}
				}

				window.location.href = url;
			}
			else {
				ops.err('账户没有权限');
			}
		});
	}

});


/*form.on('keypress', evt=> {
 console.log(evt.keyCode);
 });*/

/*
 //noinspection TypeScriptUnresolvedVariable
 if(window.env === 'test'){

 }*/


//noinspection TypeScriptUnresolvedFunction
/*$("#loginPanel").hover3d({

 selector: "#loginForm",
 sensitivity: 80,
 });*/
