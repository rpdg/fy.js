import {ops, $} from '../es6/ops.es6';


$('#liAbout').click(function () {
	ops.alert('版本： 1.0.160929 (beta 1)', $.noop, {
		title: '关于 AMS'
	});
});

var strForm = `<form style="width: 490px; padding: 20px;">
					<p><label>原有密码： <input id="old_password" name="old_password" type="password" style="width:150px;"/></label></p>
					<p><label>新设密码： <input id="new_password" name="new_password" type="password" style="width:150px;"/></label> <span class="text-gray"> (密码8~15位，大小写字母数字混合)</span></p>
					<p><label>重新输入： <input id="again_password" name="again_password" type="password" style="width:150px;"/></label> <span class="text-gray"> (再次确认您要修改的密码)</span></p>
				</form>`;
var form = $(strForm);
function setIptErr(tar) {
	var self = tar;
	tar.addClass('error').one('focus', function () {
		self.removeClass('error');
	});
}
var pop = ops.confirm(form, function () {
	var obj = form.fieldsToJson();

	if (!obj.old_password){
		setIptErr($('#old_password'));
		ops.warn("原密码不能为空");
	}

	else if (!obj.new_password){
		setIptErr($('#new_password'));
		ops.warn("新密码不能为空");
	}

	else if (!(/\w{8,15}/g).test(obj.new_password)) {
		setIptErr($('#new_password'));
		ops.warn("密码需要8～15位长度");
	}

	else if (!(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/).test(obj.new_password)) {
		setIptErr($('#new_password'));
		ops.warn("密码需要由大小写数字混合");
	}

	else if (obj.new_password != obj.again_password){
		setIptErr($('#again_password'));
		ops.warn("新密码两次输入不一致");
	}


	else {
		ops.server.editPassword(obj, function (json) {
			if (json.data) {
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

$('#liChangePsw').click(function () {
	form[0].reset();
	pop.open();

});
