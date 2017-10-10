import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {Cache} from 'ts/util/store'

opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'system/collection/collectSourceEnum',
	catalog: 'admin/catalog/findPage',
	'delete!DELETE!': 'transcode/business/delete/${id}'
});

const moduleName = '文件传输';



let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}查询`,
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

Combo.makeClearableInput($('#beginTimeBegin').datetimepicker({
	timepicker:false,
	closeOnDateSelect : true ,
	format: 'Y-m-d'
}) , $({}));
Combo.makeClearableInput($('#beginTimeEnd').datetimepicker({
	timepicker:false,
	closeOnDateSelect : true ,
	format: 'Y-m-d'
}) , $({}));

opg('#contentType').listBox({
	api : opg.api.contentType ,
	value : 'name'
});

opg('#sourceCode').listBox({
	api : opg.api.sourceTypes ,
	value : 'code'
});


let tb: Table = opg('#tb').table({
	titleBar: {
		title: `${moduleName}列表`,
		buttons: [
			{id: 'btnBatchDelete', className: 'btn-small btn-danger fl-right', html: '批量删除'}
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
				if(row.status == 2)
					return `<button class="btn-mini btn-danger" data-id="${assetId}" data-orid="${row.orderId}" data-title="${row.assetName}">删除</button>`;
			}
		}
	],
	api: opg.api.catalog,
	//lazy: true,
	pagination: {
		pageSize: 10
	},
});



//批量删除
$('#btnBatchDelete').click(function () {
	let checked = tb.getCheckData() ;
	if(checked && checked.length){
		console.log(checked);

	}
	else{
		opg.warn(`请选择${moduleName}队列`);
	}

});