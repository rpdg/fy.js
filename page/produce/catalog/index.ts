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


const infoPage = '/page/produce/catalog/metaData.html';


let panel: Panel = opg.wrapPanel('#tbSearch', {
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
				return `<button class="btn-mini btn-info" data-id="${assetId}" data-orid="${row.orderId}" data-title="${row.assetName}">编目</button>`
			}
		}
	],
	api: opg.api.catalog,
	//lazy: true,
	pagination: {
		pageSize: 10
	}
});


let cache = Cache.getInstance();

//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), assetId = btn.data('id'), orderId = btn.data('orid');
	cache.remove('checkedBatchCategory');

	let pop = parent.opg.confirm(`<iframe src="${infoPage}?assetId=${assetId}&orderId=${orderId}" />`, function (i, ifr) {
		ifr.doSave(true , pop , tb);
		return true;
	}, {
		title: `编目: ${title}`,
		btnMax: true,
		width: 900,
		height: 500,
		buttons: {
			ok: {
				className : 'btn-warning' ,
				text : '完成编目'
			},
			cancel: '返回'
		}
	}).toggle();

});


//批量编目
$('#btnBatchCataloger').click(function () {
	let checked = tb.getCheckData() ;
	if(checked && checked.length){
		console.log(checked);
		cache.set('checkedBatchCategory' , checked);

		let prog = checked[checked.length-1];
		let assetName = prog['assetName'], assetId = prog['assetId'], orderId = prog['orderId'] ;

		let pop = parent.opg.confirm(`<iframe src="${infoPage}?isBat=1&assetId=${assetId}&orderId=${orderId}" />`, function (i, ifr) {
			ifr.doSave(true , pop, tb);
			return true;
		}, {
			title: `编目: ${assetName}`,
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
		}).toggle();
	}
	else{
		opg.warn('请选择批量编目工单');
	}

});