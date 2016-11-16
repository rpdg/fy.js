import ops from 'ts/ops';
import Panel from "ts/ui/Panel";


ops.api({
	collection: 'system/collection/findPage',
	amssp: 'system/amssp/findAll',
	'delete!DELETE!': 'system/collection/delete/${id}',
	'switch!delete!': 'system/collection/switch/${id}'
});


const infoPage = '/page/admin/collection/info.html';


let panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '采集源查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//param.spCode = sel.getValue();
	console.log(param);
	tb.update(param);
});

let spHash = {};

ops('#spCode').listBox({
	api: ops.api.amssp,
	value: 'code',
	onAjaxEnd: data => {
		let arr = data.results, l = arr.length;
		while (l--) {
			let sp = arr[l];
			spHash[sp.code] = sp.name;
		}
	},
	onCreate: ()=> {
		tb.update();
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
		title: '新增采集源',
		btnMax: true,
		width: 700,
		height: 400,
		buttons: {
			ok: '保存新增采集源',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

let tb = ops('#tb').table({
	columns: [
		{
			text: '采集源名称', width: 150,
			src: 'name'
		},
		{
			text: '采集源编码', width: 120,
			src: 'code'
		},
		{
			text: '状态', width: 60,
			src: 'status',
			render: function (v) {
				return v == 1 ? '停用' : '启用';
			}
		},
		{
			text: '应答接口',
			src: 'notifyUrl'
		},
		{
			text: '节目请求接口',
			src: 'contentRequestUrl'
		},
		{
			text: '内容生产商', width: 150,
			src: 'spCode',
			render: (code)=> spHash[code]
		},
		{
			src: 'id', text: '操作', width: 160,
			render: function (val, i, row) {
				let btnUpdate = `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">修改</button> `;
				let btnDelete = row.status == 1 ? `<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>` : '<button class="btn-mini" style="visibility: hidden" disabled>删除</button>';
				let btnSwitch = `<button class="btn-mini btn-` + (row.status == 1 ? 'success' : 'warning') + `" data-id="${val}" data-title="${row.name}" data-status="${row.status}">` + (row.status == 1 ? '启用' : '停用') + `</button> `;
				return btnSwitch + btnUpdate + btnDelete;
			}
		}
	],
	api: ops.api.collection,
	lazy: true,
	pagination: {
		pageSize: 10
	}
});


//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `修改采集源: ${title}`,
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
tb.tbody.on('click', '.btn-warning,.btn-success', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');
	let state = btn.data('status') == 1 ? '启用' : '停用';

	ops.confirm(`要${state}“<b>${title}</b>”吗？`, function () {
		ops.api.switch({id: id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});

//del
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	ops.danger(`要删除“<b>${title}</b>”吗？`, function () {
		ops.api.delete({id: id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});