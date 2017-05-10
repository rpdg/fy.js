import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {store, Cache} from 'ts/util/store';

opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'system/collection/collectSourceEnum',
	programs: 'copyright/program/findPage',
	contracts: 'copyright/program/findProgramContract/${programId}',
	business: 'transcode/business/findAll',
});

const moduleName = '生产任务';

let panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}查询`,
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();

	if (param.createTimeBegin && param.createTimeBegin.indexOf(' ') < 0) {
		param.createTimeBegin += ' 00:00:00';
	}
	if (param.createTimeEnd && param.createTimeEnd.indexOf(' ') < 0) {
		param.createTimeEnd += ' 23:59:59';
	}

	//debugger;
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

Combo.makeClearableInput($('#createTimeBegin').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));
Combo.makeClearableInput($('#createTimeEnd').datetimepicker({
	//timepicker: false,
	//closeOnDateSelect: true,
	//format: 'Y-m-d'
}), $({}));


opg('#contentType').listBox({
	api: opg.api.contentType,
	value: 'name'
});


opg('#busiCodes').listBox({
	api: opg.api.business,
	value: 'name'
});



let tb: Table = opg('#tb').table({
	titleBar: {
		title: `${moduleName}列表 <span style="font-weight: 100;">（黄色：超时任务、红色：异常任务）</span>`,
	},
	rows: {
		src : 'status' ,
		render : function (val , i , row) {
			console.log(i , row);
			if(i===3)
				return 'red' ;
			if(i===6)
				return 'yellow';
		}
	} ,
	columns: [
		{
			text: '内容名称', width: 220,
			src: 'name',
			render: function (val, i, row) {
				return `<b class="ico-expandable ellipse" data-esd="${row.id}"></b> ${val}`;
			}
		},
		{
			text: '内容类型',
			src: 'contentType',
			width: 85,
		},
		{
			text: '上线时间',
			src: 'updateDate',
			width: 85,
		},
		{
			text: '创建时间',
			src: 'updateDate',
			width: 100,
		},
		{
			text: '结束时间',
			src: 'updateDate',
			width: 100,
		},
		{
			text: '生产业务',
			src: 'createTime',
			width: 100,
		},
		{
			text: '生产类型',
			src: 'createTime',
			width: 100,
		},
		{
			text: '状态',
			src: 'createTime',
			width: 100,
		},
		{
			text: '同步状态',
			src: 'creator',
			width: 85,
		},
		{
			text: '当前工位',
			src: 'creator',
			width: 85,
		},
	],
	api: opg.api.programs,
	pagination: true
});


//expand subTable
tb.tbody.on('click', '.ico-expandable', function (e) {

	let cur = $(this), programId = cur.data('esd');
	let tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		opg.api.contracts({programId}, function (data) {
			if (data && data.length) {
				let th = $(`<tr class="subTHead esd_${programId}">
						<th>工位名称</th><th colspan="2">开始时间</th><th colspan="2">结束时间</th>
						<th>操作员</th><th>耗时</th><th>执行状态</th><th colspan="2">描述</th>
					</tr>`).insertAfter(tr);

				th.bindList({
					list: data,
					template: '<tr class="subTBody esd_' + programId + '">' +
					'<td class="text-center">${programId}</td><td class="text-center" colspan="2">${createDate:=gDate}</td><td class="text-center" colspan="2">${contract}</td>' +
					'<td class="text-center">${copyrightTypeDesc}</td><td class="text-center">${copyrightTypeDesc}</td><td class="text-center">${copyrightTypeDesc}</td><td class="text-center" colspan="2">${copyrightEndDate:=gDate}</td>' +
					'</tr>',
					itemRender: {
						gDate: function (d) {
							return `${d.split(' ')[0]}`;
						}
					},
					mode: 'after'
				});

				cur.toggleClass('ellipse expanded');
			}
			else {
				opg.alert('没有合同信息');
			}
		})
	}
	else {
		cur.toggleClass('ellipse expanded');
		tr.nextAll('.esd_' + programId).remove();
	}

});


