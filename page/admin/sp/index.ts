import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";


ops.api({
	amssp: 'system/amssp/findPage',
	'delete!DELETE!': 'system/amssp/delete/${id}'
});



const infoPage = '/page/admin/sp/info.html';


var panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '内容生产商查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	var param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1 ;
	//console.log(panel.jq, param);
	tb.update(param);
});



var tb = ops('#tb').table({
	titleBar : {
		title : '内容生产商列表',
		buttons :[
			{id: 'btnAdd' , className : 'btn-create' , html: '<i class="ico-create"></i> 新增内容生产商'}
		]
	} ,
	columns: [
		{
			text: '内容生产商名称', width: 200,
			src: 'name'
		},
		{
			text: '内容生产商编码',
			src: 'code'
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
		title: '新增生产商',
		btnMax: true,
		width: 500,
		height: 300,
		buttons: {
			ok: '保存新增生产商',
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
		title: `修改生产商: ${title}`,
		btnMax: true,
		width: 500,
		height: 300,
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