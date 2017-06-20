import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;

opg.api({
	tasks: 'produce/order/findPage?stepCode=cloudTransfer',
	taskStatus: 'produce/task/getTaskStatus',
});

const moduleName = '云传输工单';

let panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}查询`,
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();

	if (param.beginTimeBegin) {
		param.beginTimeBegin += ':00';
	}
	if (param.beginTimeEnd) {
		param.beginTimeEnd += ':00';
	}

	//debugger;
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

Combo.makeClearableInput($('#beginTimeBegin').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));
Combo.makeClearableInput($('#beginTimeEnd').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));


opg('#status').listBox({
	api: opg.api.taskStatus,
	value: 'code'
});


let tb: Table = opg('#tb').table({
	titleBar: {
		title: `${moduleName}列表`,
	},
	columns: [
		{
			text: '名称',
			src: 'assetName',
		},
		{
			text: '开始日期',
			src: 'beginTime',
			width: 180,
		},
		{
			text: '结束时间',
			src: 'endTime',
			width: 180,
		},
		{
			text: '状态',
			src: 'statusDesc',
			width: 120,
		},
		{
			text: '操作',
			src: 'id', width: 120,
			render : function (val , i , row) {
				return `<button class="btn-mini btn-info btnView" data-id="${val}" data-title="${row.assetName}">查看任务</b></button>`
			}
		},
	],
	api: opg.api.tasks,
	pagination: true
});


//expand subTable
tb.tbody.on('click', '.btnView', function () {
	let btn = $(this), id = btn.data('id'), title = btn.data('title');
	opg.popTop(`<iframe src="/page/monitor/cloudTransferOrder/transferTasks.html?id=${id}" />`, {
		title: `传输任务列表： ${title}`,
		btnMax: true,
		width: 960,
		height: 480,
	});
});


