import ops from 'ts/ops.ts';

ops.api({
	amssp: 'transcode/config/findPage',
	'delete!DELETE!': 'transcode/config/delete/${id}'
});

const infoPage = '/page/transcode/config/info.html';

var panel = ops.wrapPanel('#tbSearch', {
	title: '转码配置信息',
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
		title : '转码配置列表',
		buttons :[
			{id: 'btnAdd' , className : 'btn-create' , html: '<i class="ico-create"></i> 新增转码配置'}
		]
	} ,
	columns: [
		{
			text: '业务名称', width: 220,
			src: 'bizName'
		},
		{
			text: '输入类别',
			src: 'bizCode'
		},
		{
			text: '输入源文件类型',
			src: 'bizCode'
		},
		{
			text: '输出类别',
			src: 'bizCode'
		},
		{
			text: '输出文件类型',
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
		title: '新增转码配置',
		btnMax: true,
		width: 700,
		height: 500,
		buttons: {
			ok: '保存新增转码配置',
			cancel: '取消'
		}
	});

	//console.log(pop);
});