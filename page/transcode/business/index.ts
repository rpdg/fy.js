import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";



ops.api({
	amssp: 'transcode/business/findPage',
	'delete!DELETE!': 'transcode/business/delete/${id}'
});


ops.api.delete.set('codes', {
	'transcode_business_occupied' : '业务占用中,不能删除'
});



const infoPage = '/page/transcode/business/info.html';


var panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '业务信息',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	var param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1 ;
	//console.log(panel.jq, param);
	tb.update(param);
});


var tb :Table = ops('#tb').table({
	titleBar : {
		title : '业务列表',
		buttons :[
			{id: 'btnAdd' , className : 'btn-create' , html: '<i class="ico-create"></i> 新增业务'}
		]
	} ,
	columns: [
		{
			text: '业务名称', width: 220,
			src: 'name'
		},
		{
			text: '业务编码',
			src: 'bizCode'
		},
		{
			src: 'id', text: '操作', width: 120,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">修改</button> 
						<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`
			}
		}
	],
	api: ops.api.amssp,
	//lazy: true,
	pagination: {
		pageSize: 20
	}
});



//Add new
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}" />`, function (i , ifr , v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增业务',
		btnMax: true,
		width: 500,
		height: 400,
		buttons: {
			ok: '保存新增业务',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

//edit
tb.tbody.on('click', '.btn-info', function () {
	var btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop , tb);
	}, {
		title: `修改业务: ${title}`,
		btnMax: true,
		width: 500,
		height: 400,
		buttons: {
			ok: '保存修改',
			cancel: '取消'
		}
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