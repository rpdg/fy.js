import ops from 'ts/ops.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;


ops.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'base/sourceTypes',
	catalog: 'admin/catalog/getOrderstWithNoCatlog',
	'delete!DELETE!': 'transcode/business/delete/${id}'
});


const infoPage = '/page/produce/catalog/metaData.html';


let panel: Panel = ops.wrapPanel('#tbSearch', {
	title: '编目工单查询',
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
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

Combo.makeClearableInput($('#createStart').datetimepicker({
	timepicker:false,
	closeOnDateSelect : true ,
	format: 'Y-m-d'
}) , $({}));
Combo.makeClearableInput($('#createEnd').datetimepicker({
	timepicker:false,
	closeOnDateSelect : true ,
	format: 'Y-m-d'
}) , $({}));

ops('#contentType').listBox({
	api : ops.api.contentType
});

ops('#sourceCode').listBox({
	api : ops.api.sourceTypes ,
	value : 'code'
});


let tb: Table = ops('#tb').table({
	titleBar: {
		title: '待编目列表',
		buttons: [
			{id: 'btnBatchCataloger', className: 'btn-create', html: '批量编目'}
		]
	},
	columns: [
		{
			text: '',
			src: 'assetId', cmd: 'checkAll'
		},
		{
			text: '内容名称', width: 220,
			src: 'assetName'
		},
		{
			text: '内容类型',width: 120,
			src: 'contentType'
		},
		{
			text: '来源', width: 120 ,
			src: 'sourceName'
		},
		{
			text: '创建时间', width: 150,
			src: 'createTime'
		},
		{
			text: '创建人', width: 120 ,
			src: 'creator'
		},
		{
			text: '操作', src: 'assetId', width: 70,
			render: function (assetId, i, row) {
				return `<button class="btn-mini btn-info" data-id="${assetId}" data-title="${row.assetName}">编目</button>`
			}
		}
	],
	api: ops.api.catalog,
	//lazy: true,
	pagination: {
		pageSize: 10
	}
});


//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	let pop = parent.ops.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `编目: ${title}`,
		btnMax: true,
		width: 900,
		height: 500,
		buttons: {
			ok: {
				className : 'btn-success' ,
				text : '完成编目'
			},
			cancel: '返回'
		}
	}).max();

	//to fix firefox bug
	if(navigator.userAgent.indexOf('Firefox')>-1){
		pop.restore();
	}
	/*setTimeout(function () {
		pop.restore().max();
	}, 20);*/
});


//批量编目
$('#btnBatchCataloger').click(function () {
	console.log(tb.getCheckData());
});