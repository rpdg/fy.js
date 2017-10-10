import {store} from 'ts/util/store.ts';
import opg from 'ts/opg.ts';

//noinspection TypeScriptUnresolvedVariable
store.set('apiServer', window.CONFIG.apiServer);

opg.api({
	'login!post': 'system/user/login'
});


opg.api.login.set('codes', {
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

		opg.api.login(param, function (data) {
			if (data.permissons && data.permissons.length) {

				let url = '/page/main.html';

				let previousUser = store.get('userInfo');
				if (previousUser) {
					let previousLoginName = previousUser.loginName;
					if (previousLoginName === param.loginName) {
						let hash = opg.request['returnUrl'];
						if (hash) {
							url += hash;
						}
					}
				}
				
				store.set('X-Token', data.token);
				store.set('userInfo', data.userInfo);
				store.set('permissons', data.permissons);


				$('#cycle').attr('stroke' , '#ffffff').addClass('cycle');

				/*if(opg.is.UsingIE){
					window.location.replace(url);
				}
				else{*/
					setTimeout(function(){
						window.location.replace(url);
					} , 1300);
				//}
			}
			else {
				opg.err('账户没有权限');
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
