import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {store, Cache} from 'ts/util/store';

opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'base/sourceTypes',
	collect: 'produce/order/findPage?stepCode=collect_catalog',
	'start!post!' : 'produce/collectCatalog/start/${orderId}' ,
});

const moduleName = '非编工单';

let panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}`,
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();

	if (param.beginTimeBegin && param.beginTimeBegin.indexOf(' ') < 0) {
		param.beginTimeBegin += ' 00:00:00';
	}
	if (param.beginTimeEnd && param.beginTimeEnd.indexOf(' ') < 0) {
		param.beginTimeEnd += ' 23:59:59';
	}

	//debugger;
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

Combo.makeClearableInput($('#beginTimeBegin').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}), $({}));
Combo.makeClearableInput($('#beginTimeEnd').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}), $({}));


let p1 = opg('#contentType').listBox({
	api: opg.api.contentType,
	value: 'name'
}).createdPromise;

let p2 = opg('#sourceType').listBox({
	api: opg.api.sourceTypes,
	value: 'code',
}).createdPromise;


let tb: Table = opg('#tb').table({
	api: opg.api.collect,
	lazy : true ,
	titleBar: {
		title: `${moduleName}列表`,
	},
	columns: [
		{
			text: '内容名称', width: 220,
			src: 'assetName'
		},
		{
			text: '来源',
			src: 'sourceDesc',
			width: 85,
		},
		{
			text: '创建时间',
			src: 'createTime',
			width: 150,
		},
		{
			text: '创建人',
			src: 'creator',
			width: 85,
		},
		{
			text: '执行人',
			src: 'executor',
			width: 85,
		},
		{
			text: '开始时间',
			src: 'beginTime',
			width: 150,
		},
		{
			text: '结束时间',
			src: 'endTime',
			width: 150,
		},
		{
			text: '状态',
			src: 'statusDesc',
			width: 60,
		},
		{
			text: '操作', src: 'id', width: 140,
			render: function (val, i, row) {
				return `
					<button class="btn-mini btn-warning" data-id="${val}" data-title="${row.assetName}" data-idx="${row[':index']}">发起</button> 
				    <button class="btn-mini btn-info" data-id="${val}" data-title="${row.assetName}" data-idx="${row[':index']}">添加意见</button>`;
			}
		}
	],
	pagination: true
});

$.when(p1 ,p2).then(function () {
	panel.btnSearch.click();
});





//start
tb.tbody.on('click', '.btn-warning', function () {
	let btn = $(this), title = btn.data('title'), orderId = btn.data('id'), idx = btn.data('idx');
	opg.confirm(` ${title} ` , function () {
		opg.api.start({orderId} , function () {
			opg.ok('成功发起' , function () {
				tb.update();
			});
		});
	}, {
		title : '确认发起非编'
	});

});


//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id'), idx = btn.data('idx');
	let pop = top.opg.confirm(`<iframe src="/page/collection/acquisition/collect.html?orderId=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `${moduleName}: ${title}`,
		btnMax: true,
		width: 800,
		height: 500,
		buttons: {
			ok: '采集提交',
			cancel: '取消'
		}
	});
});