import ops from 'ts/ops.ts';

ops.api({
	bizProfile: 'transcode/bizProfile/findPage',

	business: 'transcode/business/findAll',
	sourceTypes: 'base/sourceTypes',
	outTypes: 'base/outTypes',
	movietype: 'system/movietype/findAll',

	'delete!DELETE!': 'transcode/bizProfile/delete/${id}',
});

const moduleName = '转码配置';
const infoPage = '/page/transcode/config/info.html';

let panel = ops.wrapPanel('#tbSearch', {
	title: `${moduleName}信息`,
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	//debugger;
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});


//业务名称
ops('#businessId').listBox({
	api: ops.api.business,

});


//输入类别
ops('#inputSourceType').listBox({
	api: ops.api.sourceTypes,
	value: 'code'
});

//输出类别
ops('#outputDefinitionType').listBox({
	api: ops.api.outTypes,
	value: 'code'
});

//
ops.api.movietype(data=> {
	const cfg = {
		data: data,
		value: 'movieType'
	};

	ops('#inputFileMovieType').listBox(cfg);
	ops('#outputFileMovieType').listBox(cfg);
});


let tb = ops('#tb').table({
	titleBar: {
		title: `${moduleName}列表`,
		buttons: [
			{id: 'btnAdd', className: 'btn-create', html: '<i class="ico-create"></i> 新增转码配置'}
		]
	},
	columns: [
		{
			text: '业务名称', width: 220,
			src: 'bizName'
		},
		{
			text: '输入类别',
			src: 'inputSourceTypeName'
		},
		{
			text: '输入源文件类型',
			src: 'inputFileMovieType'
		},
		{
			text: '输出类别',
			src: 'outputDefinitionTypeName'
		},
		{
			text: '输出文件类型',
			src: 'outputFileMvoieType'
		},
		{
			src: 'id', text: '操作', width: 120,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.bizName}">查看</button> 
						<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.bizName}">删除</button>`
			}
		}
	],
	api: ops.api.bizProfile,
	//lazy: true,
	pagination: {
		pageSize: 10
	}
});

//view
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	top.ops.popTop(`<iframe src="/page/transcode/config/view.html?id=${id}" />`, {
		title: `查看业务: ${title}`,
		btnMax: true,
		width: 700,
		height: 400,
	});
});

//Add new
$('#btnAdd').click(function () {

	let pop = top.ops.confirm(`<iframe src="${infoPage}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `新增${moduleName}`,
		btnMax: true,
		width: 700,
		height: 400,
		buttons: {
			ok: `保存新增${moduleName}`,
			cancel: '取消'
		}
	});
});

//del
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	ops.danger(`要删除“<b>${title}</b>”吗？`, function () {
		ops.api.delete({id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});