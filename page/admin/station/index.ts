import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";


ops.api({
	amssp: 'system/amssp/findPage',
	'delete!DELETE!': 'system/amssp/delete/${id}'
});


const infoPage = '/page/admin/station/info.html';


var panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '渠道查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	var param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
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
		title: '新增渠道',
		btnMax: true,
		width: 700,
		height: 500,
		buttons: {
			ok: '保存新增渠道',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

var tb = ops('#tb').table({
	columns: [
		{
			text: '渠道名称',
			src: 'name'
		},
		{
			text: '渠道编码',
			src: 'code'
		},
		{
			text: '业务',
			src: 'code'
		},
		{
			text: '标准节目下发媒体类型', width: 200,
			src: 'code'
		},
		{
			text: '图片类型', width: 200,
			src: 'code'
		},
		{
			text: '接口版本', width: 76,
			src: 'code'
		},
		{
			text: '所属组织',
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


//edit
tb.tbody.on('click', '.btn-info', function () {
	var btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `修改渠道: ${title}`,
		btnMax: true,
		width: 700,
		height: 500,
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