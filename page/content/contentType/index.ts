import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";


ops.api({
	amssp: 'content/contentType/findPage',
	'delete!DELETE!': 'content/contentType/delete/${id}'
});



const infoPage = '/page/content/contentType/info.html';


var panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '节目类型查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	var param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1 ;
	//console.log(panel.jq, param);
	tb.update(param);
});


//Add new
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}" />`, function (i , ifr , v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增节目类型',
		btnMax: true,
		width: 400,
		height: 200,
		buttons: {
			ok: '保存新增',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

var tb = ops('#tb').table({
	columns: [
		{
			text: '节目类型名称',
			src: 'name'
		},
		{
			src: 'id', text: '操作', width: 120,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`
			}
		}
	],
	api: ops.api.amssp,
	//lazy: true,
	pagination: {
		pageSize: 10
	}
});


//edit
tb.tbody.on('click', '.btn-info', function () {
	var btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop , tb);
	}, {
		title: `修改节目类型: ${title}`,
		btnMax: true,
		width: 400,
		height: 200,
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