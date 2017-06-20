import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;

opg.api({
	tasks: 'transcode/monitor/list',
	taskStatus: 'transcode/monitor/statusEnum',
});

const moduleName = '转码工单';

let panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}查询`,
	btnSearchText: '<i class="ico-find"></i> 查询'
});


Combo.makeClearableInput($('#onlineBeginTime').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));
Combo.makeClearableInput($('#onlineEndTime').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));

opg.api.taskStatus((data)=>{
	let arr = opg.convert.hashToArray(data , (val , key)=>{
		return {id : key , name : val};
	});
	opg('#status').listBox({
		data : arr,
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



	let tb: Table = opg('#tb').table({
		titleBar: {
			title: `${moduleName}列表`,
		},
		columns: [
			{
				text: '名称',
				src: 'mediaName',
			},
			{
				text: '文件类型',
				src: 'inputProfileDesc',
			},
			{
				text: '上线日期',
				src: 'onlineTime',
			},
			{
				text: '开始时间',
				src: 'startTime',
				width: 150,
			},
			{
				text: '结束时间',
				src: 'finishTime',
				width: 150,
			},
			{
				text: '优先级',
				src: 'priority',
				width: 80,
			},
			{
				text: '状态',
				src: 'status',
				width: 150,
				render: v=> data[v]||'未知'
			},
			{
				text: '百分比',
				src: 'progress',
				width: 80,
				render : v=>v+'%'
			},
			{
				text: '操作',
				src: 'id',
				width: 80,
				render : function (val , i , row) {
					return `<button class="btn-mini btn-info btnView" data-id="${val}" data-title="${row.mediaName}">查看</b></button>`
				}
			},
		],
		api: opg.api.tasks,
		pagination: true
	});


	//expand subTable
	tb.tbody.on('click', '.btnView', function () {
		let btn = $(this), id = btn.data('id'), title = btn.data('title');
		opg.popTop(`<iframe src="/page/monitor/transcodeOrder/transcodeTask.html?id=${id}" />`, {
			title: `转码任务列表： ${title}`,
			btnMax: true,
			width: 1080,
			height: 480,
		});
	});

});




