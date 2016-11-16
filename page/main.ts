import ops from 'ts/ops.ts';
import store from 'ts/util/store.ts';
import cfg from 'ts/app.cfg.ts';

/*ops.api({
 menu: 'menu.json'
 });*/

//ops.api.menu(function (json) {

let permissions = store.get('permissons');


let menu = {}, curMainMenuId;

for (let i = 0, l = permissions.length; i < l; i++) {
	let mn = permissions[i];
	menu['#' + mn.id] = mn;
}

let mainMenu = $('#mainMenu'), subMenu = $('#subMenu'), mainFrame: JQuery = $('#mainFrame');

/*if (permissions.length > 6) {
 mainMenu.addClass('small-menu');
 }*/


let mainMenuSelector = 'a:eq(0)', subMenuSelector = 'a:eq(0)';
if (location.hash.length > 1) {
	let ph = location.hash.split('/');
	mainMenuSelector = '#\\' + ph[0];
	if (ph[1]) {
		subMenuSelector = '#\\/' + ph[1];
	}
}

subMenu.on('click', 'a', function () {
	let sm = $(this);
	sm.addClass('cur').siblings('.cur').removeClass('cur');
	mainFrame.attr('src', sm.attr('href') as string);
	location.hash = curMainMenuId + sm[0].id;


	if (sm.hasClass('hasChildren')) {
		console.warn(sm.text() + ' has permission control!');
	}
	return false;
});

mainMenu.on('click', 'a', function () {
	let cur = $(this), mnId = cur.attr('href');
	curMainMenuId = mnId;
	cur.addClass('cur').siblings('.cur').removeClass('cur');

	subMenu.bindList({
		template: '<a id="/${id}" href="${url}" target="mainFrame" class="${id:=g}">${name}</a>',
		list: menu[mnId].children,
		itemRender: {
			g: (v, i, row)=> {
				if (row.children && row.children.length) {
					return 'hasChildren';
				}
			}
		}
	}).find(subMenuSelector).click();

	if (subMenuSelector != 'a:eq(0)')
		subMenuSelector = 'a:eq(0)';

});


mainMenu.bindList({
	template: '<a id="#${id}" href="#${id}">${name}</a>',
	list: permissions
}).find(mainMenuSelector).click();


let wViewport = window.document.documentElement.clientWidth, wMenu = mainMenu.outerWidth();
console.log(wViewport - wMenu);

if (wViewport - wMenu < 0) {
	mainMenu.addClass('nano-menu');
}
if (wViewport - wMenu < 150) {
	mainMenu.addClass('mini-menu');
}
else if (wViewport - wMenu < 300) {
	mainMenu.addClass('small-menu');
}


$('#liAbout').click(function () {
	ops.alert(`版本： ${cfg.version}`, $.noop, {
		title: '关于 AMS'
	});
});


let modifyPsw = (function () {

	let form, pop;

	return function () {
		if (!form) {
			let strForm = `<form style="width: 490px; padding: 20px;">
					<p><label>原有密码： <input id="old_password" name="old_password" type="password" maxlength="15" style="width:150px;"/></label></p>
					<p><label>新设密码： <input id="new_password" name="new_password" type="password" maxlength="15" style="width:150px;"/></label> <span class="text-gray"> (密码8~15位，大小写字母数字混合)</span></p>
					<p><label>重新输入： <input id="again_password" name="again_password" type="password" maxlength="15" style="width:150px;"/></label> <span class="text-gray"> (再次确认您要修改的密码)</span></p>
				</form>`;

			form = $(strForm);

			pop = ops.confirm(form, function () {
				let obj = form.fieldsToJson();

				if (!obj.old_password) {

					$('#old_password').iptError('原密码不能为空');

				}

				else if (!obj.new_password) {
					$('#new_password').iptError('新密码不能为空');

				}

				else if (obj.new_password.length < 8 || obj.new_password.length > 15) {
					$('#new_password').iptError('密码长度需要8～15位');
				}

				else if (!(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/).test(obj.new_password)) {
					$('#new_password').iptError('密码需要由大小写数字混合');
				}

				else if (obj.new_password != obj.again_password) {
					$('#again_password').iptError('新密码两次输入不一致');
				}


				else {
					ops.api.editPassword(obj, function (json) {
						if (json.result) {
							pop.close();
							ops.ok('修改成功');
						}
						else
							ops.err('修改失败');
					});
				}
				return true;
			}, {
				title: '修改密码',
				show: false,
				destroy: false
			});
		}
		else {
			form[0].reset();
		}

		pop.open();
	};

})();

$('#liChangePsw').click(modifyPsw);

$('#liLogOff').click(()=> {
	store.clear();
	window.location.href = cfg.loginPage;
});

/*
$('#liFullScreen').click(evt=> {
	// Test for each of the supported versions of full screen APIs and call
	// either requestFullscreen or cancelFullScreen (or exitFullScreen)
	//  Structure:
	//  Does the incoming target support requestFullscreen (or prefaced version)
	//  if (there is a fullscreen element)
	//      then cancel or exit
	//  else request full screen mode

	let divObj = evt.target as Node;  //  get the target element

	if (divObj.requestFullscreen)
		if (document.fullScreenElement) {
			document.cancelFullScreen();
		} else {
			document.documentElement.requestFullscreen();
		}
	else if (divObj.webkitRequestFullscreen)
		if (document.webkitFullscreenElement) {
			document.webkitCancelFullScreen();
		} else {
			document.documentElement.webkitRequestFullscreen();
		}
	else if (divObj.msRequestFullscreen)
		if (document.msFullscreenElement) {
			document.msExitFullscreen();
		} else {
			document.body.msRequestFullscreen();
		}
	else if (divObj.mozRequestFullScreen)
		if (document.mozFullScreenElement) {
			document.mozCancelFullScreen();
		} else {
			document.documentElement.mozRequestFullScreen();
		}
	//  stop bubbling so we don't get bounce back
	evt.stopPropagation();

})
*/