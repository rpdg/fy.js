import ops from 'ts/ops.ts';
import store from 'ts/util/store.ts';
import cfg from 'ts/app.cfg.ts';

/*ops.api({
 menu: 'menu.json'
 });*/

//ops.api.menu(function (json) {

var permissions = store.get('permissons');


var menu = {}, curMainMenuId;

for (let i = 0, l = permissions.length; i < l; i++) {
	let mn = permissions[i];
	menu['#' + mn.id] = mn;
}

var mainMenu = $('#mainMenu'), subMenu = $('#subMenu'), mainFrame: JQuery = $('#mainFrame');

if (permissions.length > 6) {
	mainMenu.addClass('small-menu');
}

var mainMenuSelector = 'a:eq(0)', subMenuSelector = 'a:eq(0)';
if (location.hash.length > 1) {
	var ph = location.hash.split('/');
	mainMenuSelector = '#\\' + ph[0];
	if (ph[1]) {
		subMenuSelector = '#\\/' + ph[1];
	}
}

subMenu.on('click', 'a', function () {
	var sm = $(this);
	sm.addClass('cur').siblings('.cur').removeClass('cur');
	mainFrame.attr('src', sm.attr('href') as string);
	location.hash = curMainMenuId + sm[0].id;

	if (sm.hasClass('hasChildren')) {
		console.warn(sm.text() + ' has permission control!');
	}
	return false;
});

mainMenu.on('click', 'a', function () {
	var cur = $(this), mnId = cur.attr('href');
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


//});


$('#liAbout').click(function () {
	ops.alert(`版本： ${cfg.version}`, $.noop, {
		title: '关于 AMS'
	});
});


var modifyPsw = (function () {

	var form, pop;

	return function () {
		if (!form) {
			var strForm = `<form style="width: 490px; padding: 20px;">
					<p><label>原有密码： <input id="old_password" name="old_password" type="password" maxlength="15" style="width:150px;"/></label></p>
					<p><label>新设密码： <input id="new_password" name="new_password" type="password" maxlength="15" style="width:150px;"/></label> <span class="text-gray"> (密码8~15位，大小写字母数字混合)</span></p>
					<p><label>重新输入： <input id="again_password" name="again_password" type="password" maxlength="15" style="width:150px;"/></label> <span class="text-gray"> (再次确认您要修改的密码)</span></p>
				</form>`;

			form = $(strForm);

			pop = ops.confirm(form, function () {
				var obj = form.fieldsToJson();

				if (!obj.old_password) {

					$('#old_password').iptError('原密码不能为空');

				}

				else if (!obj.new_password) {
					$('#new_password').iptError('新密码不能为空');

				}

				else if (!(/\w{8,15}/g).test(obj.new_password)) {
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
							pop.hide();
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

$('#liLogOff').click(function () {
	store.clear();
	window.location.href = cfg.loginPage;
});