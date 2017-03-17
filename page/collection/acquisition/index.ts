import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {store, Cache} from 'ts/util/store';

opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'system/collection/collectSourceEnum',
	collect: 'admin/collect/findPage',
});

const moduleName = '内容采集';

let panel = opg.wrapPanel('#tbSearch', {
	title: `${moduleName}`,
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
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}), $({}));
Combo.makeClearableInput($('#createTimeEnd').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}), $({}));


opg('#contentType').listBox({
	api: opg.api.contentType,
	value: 'name'
});

opg('#source').listBox({
	api: opg.api.sourceTypes,
	value: 'code'
});


let tb: Table = opg('#tb').table({
	titleBar: {
		title: '待采集列表',
	},
	columns: [
		{
			text: '内容名称', width: 220,
			src: 'assetName'
		},
		{
			text: '内容类型',
			src: 'contentType',
			width: 85,
		},
		{
			text: '来源',
			src: 'sourceName',
			width: 85,
		},
		{
			text: '创建时间',
			src: 'createTime',
			width: 100,
		},
		{
			text: '创建人',
			src: 'creator',
			width: 85,
		},
		{
			text: '操作', src: 'assetId', width: 60,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">采集</button>`;
			}
		}
	],
	api: opg.api.collect,
	pagination: true
});

//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id'), idx = btn.data('idx');
	let pop = top.opg.confirm(`<iframe src="/page/collection/acquisition/collect.html??id=${id}" />`, function (i, ifr) {
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