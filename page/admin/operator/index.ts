import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";
import {ListBox} from "ts/ui/FormControls.ts";


ops.api({
	collection: 'system/collection/findPage',
	amssp: 'system/amssp/findPage?pageNo=1&pageSize=9999',
	'delete!DELETE!': 'system/collection/delete/${id}'
});


const infoPage = '/page/admin/collection/info.html';


var panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '操作员查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	var param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//param.spCode = sel.getValue();
	console.log(param);
	tb.update(param);
});


//Add new
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增操作员',
		btnMax: true,
		width: 700,
		height: 400,
		buttons: {
			ok: '保存新增操作员',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

var tb = ops('#tb').table({
	titleBar: {
		title: '操作员列表',
		buttons: [
			{id: 'btnAdd', className: 'btn-create', html: '<i class="ico-create"></i> 新增操作员'}
		]
	},
	columns: [
		{
			text: '登录名',
			src: 'name'
		},
		{
			text: '用户名',
			src: 'code'
		},
		{
			text: '所属组织', width: 120,
			src: 'code'
		},
		{
			text: '状态', width: 60,
			src: 'status',
			render: function (v) {
				return v == 1 ? '禁用' : '正常';
			}
		},
		{
			text: '创建人',
			src: 'code'
		},
		{
			src: 'id', text: '操作', width: 210,
			render: function (val, i, row) {
				var btnUpdate = `<button class="btn-mini btn-primary" data-id="${val}" data-title="${row.name}">修改</button> `;
				var btnMoPass = `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">修改密码</button> `;
				var btnDelete = row.status == 1 ? `<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>` : ' 　　　';
				var btnSwitch = `<button class="btn-mini btn-` + (row.status == 1 ? 'success' : 'warning') + `" data-id="${val}" data-title="${row.name}" data-status="${row.status}">` + (row.status == 1 ? '启用' : '停用') + `</button> `;
				return btnSwitch + btnUpdate + btnMoPass + btnDelete;
			}
		}
	],
	api: ops.api.collection,
	pagination: {
		pageSize: 10
	}
});


//edit
tb.tbody.on('click', '.btn-info', function () {
	var btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `修改操作员: ${title}`,
		btnMax: true,
		width: 700,
		height: 400,
		buttons: {
			ok: '保存修改',
			cancel: '取消'
		}
	});
});


//switch
tb.tbody.on('click', '.btn-warning', function () {
	var btn = $(this), title = btn.data('title'), id = btn.data('id');
	var state = btn.data('status') == 1 ? '启用' : '停用';

	ops.confirm(`要${state}“<b>${title}</b>”吗？`, function () {
		ops.api.stop({id: id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});

//del
tb.tbody.on('click', '.btn-danger', function () {
	var btn = $(this), title = btn.data('title'), id = btn.data('id');

	ops.danger(`要删除“<b>${title}</b>”吗？`, function () {
		ops.api.delete({id: id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});