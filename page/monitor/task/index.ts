import opg from 'ts/opg.ts';
import Panel from 'ts/ui/Panel.ts';
import Table from 'ts/ui/Table.ts';
import {Combo} from 'ts/ui/Combo' ;
import {store, Cache} from 'ts/util/store';

opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'system/collection/collectSourceEnum',
	tasks: 'produce/task/findPage',
	'getOrders!!': 'produce/task/getOrders/${taskId}',
	business: 'transcode/business/findAll',
	taskStatus: 'produce/task/getTaskStatus',
});

const moduleName = '生产任务';

let panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}查询`,
	btnSearchText: '<i class="ico-find"></i> 查询',
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();

	if (param.onlineTimeBegin) {
		param.onlineTimeBegin += ':00';
	}
	if (param.onlineTimeEnd) {
		param.onlineTimeEnd += ':00';
	}

	//debugger;
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

Combo.makeClearableInput($('#onlineTimeBegin').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));
Combo.makeClearableInput($('#onlineTimeEnd').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));


opg('#contentType').listBox({
	api: opg.api.contentType,
	value: 'name',
});


opg('#busiCodes').listBox({
	api: opg.api.business,
	value: 'bizCode',
});


opg('#status').listBox({
	api: opg.api.taskStatus,
	value: 'code',
});


let tb: Table = opg('#tb').table({
	titleBar: {
		title: `${moduleName}列表 <span style="font-weight: 100;">（黄色：超时任务、红色：异常任务）</span>`,
	},
	rows: {
		src: 'status',
		render: function (val, i, row) {
			//console.log(i , row);
			if (row.delay == 1)
				return 'yellow';
			if (row.resultCode != 0)
				return 'red';
			else {
				if (row.processType == 'ReAudit') {
					return 'gray';
				}
				else if (row.processType == 'NewBusiness') {
					return 'green';
				}
			}
		},
	},
	columns: [
		{
			text: '内容名称', width: 220,
			src: 'managerName',
			render: function (val, i, row) {
				return `<b class="ico-expandable ellipse" data-tsd="${row.id}"></b> ${val}`;
			},
		},
		{
			text: '内容类型',
			src: 'contentType',
			width: 85,
		},
		{
			text: '上线时间',
			src: 'onlineTime',
			width: 85,
			render: (v) => {
				if (v)
					return v.split(' ')[0];
				return '';
			},
		},
		{
			text: '创建时间',
			src: 'createTime',
			width: 100,
		},
		{
			text: '结束时间',
			src: 'endTime',
			width: 100,
		},
		{
			text: '生产业务',
			src: 'busiCodes',
			width: 100,
		},
		{
			text: '生产类型',
			src: 'processTypeDesc',
			width: 100,
		},
		{
			text: '状态',
			src: 'statusDesc',
			width: 100,
		},
		{
			text: '同步状态',
			src: 'syncStatusDesc',
			width: 85,
		},
		{
			text: '当前工位',
			src: 'currentSteps',
			width: 100,
		},
	],
	api: opg.api.tasks,
	pagination: true,
});

//expand subTable
tb.tbody.on('click', '.ico-expandable', function (e) {

	let cur = $(this), taskId = cur.data('tsd');
	let tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		opg.api.getOrders({taskId}, function (data) {
			if (data && data.length) {
				let th = $(`<tr class="subTHead esd_${taskId}">
						<th>工位名称</th><th colspan="2">开始时间</th><th colspan="2">结束时间</th>
						<th>操作员</th><th>耗时</th><th>执行状态</th><th colspan="2">描述</th>
					</tr>`).insertAfter(tr);

				th.bindList({
					list: data,
					template: '<tr class="subTBody esd_' + taskId + '">' +
					'<td class="text-center">${stepCodeDesc}</td><td class="text-center" colspan="2">${beginTime}</td><td class="text-center" colspan="2">${endTime}</td>' +
					'<td class="text-center">${executor}</td><td class="text-center">${spendDesc}</td><td class="text-center">${statusDesc}</td><td class="text-center" colspan="2">${message}</td>' +
					'</tr>',
					mode: 'after',
				});

				cur.toggleClass('ellipse expanded');
			}
			else {
				opg.alert('没有工单信息');
			}
		});
	}
	else {
		cur.toggleClass('ellipse expanded');
		tr.nextAll(`.esd_${taskId}`).remove();
	}

});


