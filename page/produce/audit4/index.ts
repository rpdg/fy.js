import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";



ops.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'base/sourceTypes',
	audit: 'audit/findPage',
	'delete!DELETE!': 'transcode/business/delete/${id}'
});


const infoPage = '/page/transcode/business/info.html';



let panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '技审工单查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	if(param.createStart){
		param.createStart += ' 00:00:00' ;
	}
	if(param.createEnd){
		param.createEnd += ' 23:59:59' ;
	}
	param.pageNo = 1 ;
	//console.log(panel.jq, param);
	tb.update(param);
});

$('#createTimeBegin,#createTimeEnd').datetimepicker({
	timepicker:false,
	closeOnDateSelect : true ,
	format: 'Y-m-d'
});


ops('#contentType').listBox({
	api : ops.api.contentType
});

ops('#sourceCode').listBox({
	api : ops.api.sourceTypes ,
	value : 'code'
});


let tb :Table = ops('#tb').table({
	titleBar : {
		title : '技审列表',
	} ,
	columns: [
		{
			text: '内容名称', width: 220,
			src: 'managerName'
		},
		{
			text: '展示名称',
			src: 'assetShowName'
		},
		{
			text: '内容类型',
			src: 'ctype'
		},
		{
			text: '生产类型',
			src: 'type'
		},
		{
			text: '创建时间',
			src: 'createTime'
		},
		{
			text: '上线时间',
			src: 'onlineTime'
		},
		{
			text: '发起人',
			src: 'creator'
		},
		{
			text: '生产业务',
			src: 'xxxx'
		},
		{
			text: '来源',
			src: 'source'
		},
		{
			text: '审片要求',
			src: 'audit4'
		},
		{
			text: '操作人',
			src: 'executor'
		},
		{
			text: '操作', src: 'orderId', width: 60,
			render: function (val, i, row) {
				if(row.state>0)
					return `<button class="btn-mini btn-primary" data-id="${val}" data-title="${row.name}">查看</button>`;
				return `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">技审</button>`
			}
		}
	],
	api: ops.api.audit ,
	//lazy: true,
	pagination: {
		pageSize: 10
	}
});


//edit
tb.tbody.on('click', '.btn-info', function () {

});
