import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";
import {ListBox} from "ts/ui/FormControls.ts";
import {store} from "../../../ts/util/store";


ops.api({
	operators: 'system/user/findPage',
	amssp: 'system/amssp/findPage?pageNo=1&pageSize=9999',
	'delete!DELETE!': 'system/user/${id}',
	'enable!PUT!': 'system//user/enable/${id}',
	'disable!PUT!': 'system/user/disable/${id}',
	'changePassword!PUT': 'system/user/changePassword',
});


const infoPage = '/page/admin/operator/info.html';


let panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '操作员查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//param.spCode = sel.getValue();
	console.log(param);
	tb.update(param);
});

let mine = store.get('userInfo'), myId = mine ? mine.id : 0;
let tb = ops('#tb').table({
	titleBar: {
		title: '操作员列表',
		buttons: [
			{id: 'btnAdd', className: 'btn-create', html: '<i class="ico-create"></i> 新增操作员'}
		]
	},
	columns: [
		{
			text: '登录名', width: 150,
			src: 'loginName'
		},
		{
			text: '用户名', width: 150,
			src: 'name'
		},
		{
			text: '所属组织',
			src: 'orgName'
		},
		{
			text: '状态', width: 60,
			src: 'status',
			render: function (v) {
				return v == 1 ? '禁用' : '正常';
			}
		},
		{
			text: '创建人', width: 150,
			src: 'createName'
		},
		{
			src: 'id', text: '操作', width: 240,
			render: function (currentId, i, row) {
				if (currentId != myId) {
					let btnUpdate = `<button class="btn-mini btn-info" data-id="${currentId}" data-title="${row.name}">修改</button> `;
					let btnMoPass = `<button class="btn-mini btn-primary" data-id="${currentId}" data-title="${row.name}">修改密码</button> `;
					let btnDelete = row.status == 1 ? `<button class="btn-mini btn-danger" data-id="${currentId}" data-title="${row.name}">删除</button>` : '<button class="btn-mini" style="visibility: hidden" disabled>删除</button>';
					let btnSwitch = `<button class="btn-mini btn-` + (row.status == 1 ? 'success' : 'warning') + `" data-id="${currentId}" data-title="${row.name}" data-status="${row.status}">` + (row.status == 1 ? '启用' : '禁用') + `</button> `;
					return btnSwitch + btnUpdate + btnMoPass + btnDelete;
				}
				else {
					return `<span class="text-gray">不可更改自身</span>`;
				}
			}
		}
	],
	api: ops.api.operators,
	pagination: {
		pageSize: 10
	}
});


//Add new
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.ops.confirm(`<iframe src="${infoPage}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增操作员',
		btnMax: true,
		width: 600,
		height: 500,
		buttons: {
			ok: '保存新增操作员',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `修改操作员: ${title}`,
		btnMax: true,
		width: 600,
		height: 500,
		buttons: {
			ok: '保存修改',
			cancel: '取消'
		}
	});
});


//change password
tb.tbody.on('click', '.btn-primary', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');
	let form;
	let strForm = `<form style="width: 490px; padding: 20px;">
					<input name="userId" type="hidden" value="${id}"/>
					<p><label>新设密码： <input id="new_password" name="password" type="password" maxlength="15" style="width:150px;"/></label> <span class="text-gray"> (密码8~15位，大小写字母数字混合)</span></p>
					<p><label>重新输入： <input id="again_password" name="again_password" type="password" maxlength="15" style="width:150px;"/></label> <span class="text-gray"> (再次确认要修改的密码)</span></p>
				</form>`;

	form = $(strForm);

	let pop = ops.confirm(form, function () {

		let obj = form.fieldsToJson({
			password: {
				type: 'password'
			}
		});

		if (obj) {

			if (obj.password != obj.again_password) {
				$('#again_password').iptError('两次输入的密码不一致');
			}

			else {
				delete obj.again_password;

				ops.api.changePassword(obj, ()=> {
					ops.ok('修改成功');
					pop.close();
				});
			}

		}

		return true;

	}, {
		title: `修改操作员“${title}”的密码`
	});
});

//switch
tb.tbody.on('click', '.btn-warning,.btn-success', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id'), status = btn.data('status');
	let stateTxt = status == 1 ? '启用' : '禁用';

	ops.confirm(`要${stateTxt}操作员“<b>${title}</b>”吗？`, function () {
		ops.api[status == 1 ? 'enable' : 'disable']({id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});

//del
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	ops.danger(`要删除操作员“<b>${title}</b>”吗？`, function () {
		ops.api.delete({id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});