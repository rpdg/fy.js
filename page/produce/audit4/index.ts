import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {store, Cache} from 'ts/util/store';

let currentUser = store.get('userInfo');

console.log('currentUser', currentUser);

opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'system/collection/collectSourceEnum',
	audit: 'audit/findPage',
	'delete!DELETE!': 'transcode/business/delete/${id}'
});


let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '四审工单查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
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


panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson({});

	if (param.createTimeBegin && param.createTimeBegin.indexOf(' ') < 0) {
		param.createTimeBegin += ' 00:00:00';
	}
	if (param.createTimeEnd && param.createTimeEnd.indexOf(' ') < 0) {
		param.createTimeEnd += ' 23:59:59';
	}
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});


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
		title: '四审列表',
	},
	columns: [
		{
			text: '内容名称', width: 220,
			src: 'managerName'
		},
		{
			text: '展示名称',
			src: 'assetShowName'
		},
		{
			text: '内容类型',
			src: 'ctype',
			width: 85,
		},
		{
			text: '生产类型',
			src: 'type',
			width: 100,
		},
		{
			text: '创建时间',
			src: 'createTime'
		},
		{
			text: '上线时间',
			src: 'onlineTime'
		},
		{
			text: '发起人',
			src: 'creator',
			width: 85,
		},
		{
			text: '生产业务',
			src: 'busiCode',
			width: 85,
		},
		{
			text: '来源',
			src: 'source',
			width: 85,
		},
		{
			text: '审片要求',
			src: 'audit4',
			width: 85,
		},
		{
			text: '操作人',
			src: 'executor',
			width: 85,
		},
		{
			text: '操作', src: 'assetId', width: 60,
			render: function (val, i, row) {
				if (!row.executor || (row.executor == currentUser.loginName))
					return `<button class="btn-mini btn-warning" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">四审</button>`;
				return '';
				//return `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">查看</button>`;
			}
		}
	],
	api: opg.api.audit,
	onAjaxEnd: (data) => {
		list = data.results;
	},
	pagination: {
		pageSize: 10
	}
});

let cache = Cache.getInstance(), list = [];

//edit
tb.tbody.on('click', '.btn-warning', function () {
	let btn = $(this), title = btn.data('title'), assetId = btn.data('id'), idx = btn.data('idx');

	openInfoWindow(assetId, idx, {
		title: title,
		btnMax: true,
		width: 900,
		height: 500,
		buttons: {
			btnNoPlay: {
				className: 'btn-danger',
				text: '不可播',
			},
			btnPutBack: {
				className: 'btn-warning',
				text: '打回',
			},
			ok: {
				className: 'btn-success',
				text: '通过'
			},
			cancel: {
				className: 'btn',
				text: '取消'
			},
			returnBtn: '返回',
		},
		callback: function (i, ifr) {
			if (i === 0) {
				ifr.doSave();
				return true;
			}
			else {

			}
		}
	});
});

//view
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), assetId = btn.data('id'), idx = btn.data('idx');
	openInfoWindow(assetId, idx, {
		title: title,
		btnMax: true,
		width: 900,
		height: 500,
		buttons: {
			ok: {
				className: 'btn',
				text: '返回',
			}
		}
	});
});

function openInfoWindow(assetId: number|string, index: number, sets: any = {}) {
	cache.set('currentRow', list[index]);
	sets.onDestroy = function () {
		console.log('--- remove ---');
		cache.remove('currentRow');
	};

	console.log(sets);

	top.opg(`<iframe src="/page/produce/audit4/info.html?assetId=${assetId}" allowfullscreen />`).popup(sets).toggle();
}
