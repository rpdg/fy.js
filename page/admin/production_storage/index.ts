import opg from 'ts/opg.ts';

opg.api({
	storages: 'storage/findPage',
	storageTypes: 'base/storageTypes', //存储类型
	'delStorage!DELETE!': 'storage/delStorage//${id}',
});


const infoPage = __uri('./storage.html');


let panel = opg.wrapPanel('#tbSearch', {
	title: '生产存储查询',
	btnSearchText: '<i class="ico-find"></i> 查询',
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});


//类型
opg('#type').listBox({
	api: opg.api.storageTypes,
	onAjaxEnd: (json) => {
		json.results = opg.convert.hashToArray(json, (val, key) => {
			return {name: val, id: key};
		});
		console.log(json);
	},
});


let tb = opg('#tb').table({
	api: opg.api.storages ,
	titleBar: {
		title: '生产存储列表',
		buttons: [
			{id: 'btnAdd', className: 'btn-create', html: '<i class="ico-create"></i> 新增存储'},
		],
	},
	columns: [
		{
			text: '存储名称', width: 180,
			src: 'name',
		},
		{
			text: '存储Code', width: 180,
			src: 'code',
		},
		{
			text: '存储地址',
			src: 'path',
		},
		{
			text: '存储类型', width: 120,
			src: 'typeDesc',
		},
		{
			src: 'id', text: '操作', width: 120,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-primary btnEditRule" data-id="${val}" data-title="${row.name}">修改</button> 
						<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`;
			},
		},
	],
	//lazy: true,
	pagination: {
		pageSize: 10,
	},
});

//Add a new
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg.confirm(`<iframe src="${infoPage}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增存储',
		btnMax: true,
		width: 640,
		height: 400,
		buttons: {
			ok: '保存新增存储',
			cancel: '取消',
		},
	});

	//console.log(pop);
});

//edit
tb.tbody.on('click', '.btnEditRule', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `修改存储: ${title}`,
		btnMax: true,
		width: 640,
		height: 400,
		buttons: {
			ok: '保存修改',
			cancel: '取消',
		},
	});
});



//delete
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.danger(`要删除存储 “<b>${title}</b>” 吗？`, function () {
		opg.api.delStorage({id: id}, () => tb.update());
	}, {
		title: '请确认',
	});
});