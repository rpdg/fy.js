import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import Panel from "ts/ui/Panel.ts";

opg.api({
	'collect': 'admin/collect/findPageWithProgress',
	'delete!DELETE!': 'content/contentType/delete/${id}',
	'finishCollect': 'admin/collect/finishCollect', //完成采集
	'retryCollect': 'admin/collect/retryCollect', //重转码
});

const moduleName = '采集工单监控';

const workStatus = [{id:0 , name:'待采集'} , {id:1 , name:'采集中'} , {id:2 , name:'采集完成'} , {id:3 , name:'采集失败'} , ];
const workStatusHash = opg.convert.arrayToHash(workStatus , 'id');

opg('#status').listBox({
	data : workStatus,
});
let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}`,
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();

	if (param.showStart && param.showStart.indexOf(' ') < 0) {
		param.showStart += ' 00:00:00';
	}
	if (param.showEnd && param.showEnd.indexOf(' ') < 0) {
		param.showEnd += ' 23:59:59';
	}

	//debugger;
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

Combo.makeClearableInput($('#showStart').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}), $({}));
Combo.makeClearableInput($('#showEnd').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}), $({}));


//create a data table
let tb: Table = opg('#tb').table({
	api: opg.api.collect,
	titleBar: {
		title: '采集工单列表',
	},
	columns: [
		{
			text: '名称',
			width: 200,
			src: 'assetName'
		},
		{
			text: '文件类型',
			width: 80,
			src: 'contentType'
		},
		{
			text: '上线日期',
			src: 'showTime'
		},
		{
			text: '开始时间',
			src: 'beginTime'
		},
		{
			text: '结束时间',
			src: 'endTime'
		},
		{
			text: '优先级',
			width: 60,
			src: 'priority'
		},
		{
			text: '状态',
			width: 100,
			src: 'status',
			render : (v)=>{
				//console.log(v , workStatusHash)
				return workStatusHash[v]?workStatusHash[v].name:v ;
			}
		},
		{
			text: '百分比',
			width: 60,
			src: 'progress'
		},
		{
			text: '任务详情',
			src: 'description'
		},
		{
			text: '操作',
			src: 'taskId',
			width: 180,
			render: (taskId, i, row) => {
				return `
					<button class="btn-mini btn-info" data-id="${taskId}" data-title="${row.name}">查看</button>
					<button class="btn-mini btn-success" data-id="${taskId}" data-title="${row.name}">完成采集</button> 
					<button class="btn-mini btn-danger" data-id="${taskId}" data-title="${row.name}">重转码</button> 
				`;
			}
		}
	],
	pagination: {
		pageSize: 10
	}
});

//re-transCode
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), taskId = btn.data('id');

	opg.api.retryCollect({taskId}, () => {
		opg.ok('重转码');
		tb.update();
	});
});

//finish
tb.tbody.on('click', '.btn-success', function () {
	let btn = $(this), title = btn.data('title'), taskId = btn.data('id');

	opg.api.finishCollect({taskId}, () => {
		opg.ok('完成采集');
		tb.update();
	});
});

//view only
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.popTop(`<iframe src="/page/collection/worksheet/worksheet.html?id=${id}" />`, {
		title: `查看采集工单: ${title}`,
		btnMax: true,
		width: 980,
		height: 520,
	});
});

