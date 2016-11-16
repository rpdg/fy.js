import ops from 'ts/ops.ts';

ops.api({
	amssp: 'content/contentType/findPage',
	'delete!DELETE!': 'content/contentType/delete/${id}'
});


const infoPage = '/page/content/contentType/info.html';

//wrap as search panel
let panel = ops.wrapPanel('#tbSearch', {
	title: '节目类型查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

//click to search
panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

//create a data table
let tb = ops('#tb').table({
	api: ops.api.amssp,
	columns: [
		{
			text: '节目类型名称',
			src: 'name'
		},
		{
			text: '操作',
			src: 'id',
			width: 120,
			render: (val, i, row)=> `<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`
		}
	],
	pagination: {
		pageSize: 10
	}
});


//Add new
$('#btnAdd').click(function () {

	let pop = top.ops.confirm(`<iframe src="${infoPage}" />`, function (i, ifr) {
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

});

//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	let pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
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


//delete
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	ops.danger(`要删除“<b>${title}</b>”吗？`, function () {
		ops.api.delete({id: id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});