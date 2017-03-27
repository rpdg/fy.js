import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {store, Cache} from 'ts/util/store';

import ValidTimeModifier from './module/modifyValidTime';
import AddEpisode from './module/addEpisode';
import ReTranscode from './module/reTranscode';
import ReAudit from './module/reAudit';


opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'system/collection/collectSourceEnum',
	contentList: 'produce/asset/findPage',
	business: 'transcode/business/findAll',
	'delete!DELETE!': 'produce/asset/delete/${id}'
});

let cache = Cache.getInstance();

let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '内容检索',
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

opg.api.business((data) => {
	let values = data.results;
	//cache.set('businessHash', opg.convert.arrayToHash(values , 'bizCode'));
	opg('#b1').listBox({
		data: values,
		text: 'name',
		value: 'bizCode'
	});
	opg('#b2').listBox({
		data: values,
		text: 'name',
		value: 'bizCode'
	});
});


let list = [];
let tb: Table = opg('#tb').table({
	titleBar: {
		title: '内容列表',
		buttons: [
			{id: 'btnAdd', className: 'btn-create', html: '<i class="ico-create"></i> 新增'}
		],
	},
	columns: [
		{
			text: '内容名称', width: 220,
			src: 'managerName'
		},
		{
			text: '内容类型', width: 90,
			src: 'contentType'
		},
		{
			text: '入库时间',
			src: 'createTime',
			width: 120,
		},
		{
			text: '已生产业务',
			src: 'busiCodes',
			//width: 120,
		},
		{
			text: '生产中业务',
			src: 'produceBusiCodes',
		},
		{
			text: '生产中类型',
			src: 'processTypes',
			//width: 150,
		},
		{
			text: '来源',
			src: 'source',
			width: 70,
		},
		{
			text: '状态',
			src: 'status',
			width: 70,
		},
		{
			text: '操作', align: 'left',
			src: 'id',
			width: 280,
			render: function (val, i, row) {
				let btnHTML = `
					<button class="btn-mini btn-info btnView" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">查看</button>
				`;
				if (row.updateValidTime_visible) {
					btnHTML += `
						<button class="btn-mini btn-warning btnModifyTime" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}" data-time="${row.validTime || ''}">修改生效时间</button>
					`;
				}
				if (row.addEpisode_visible) {
					btnHTML += `
						<button class="btn-mini btn-primary btnAddEpisode" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">添加剧集</button>
					`;
				}
				if (row.reTranscode_visible) {
					btnHTML += `
						<button class="btn-mini btn-warning btnReTranscode" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">再转码</button>
					`;
				}
				if (row.reAudit_visible) {
					btnHTML += `
						<button class="btn-mini btn-warning btnReAudit" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">重播重审</button>
					`;
				}
				if (row.fileRestore_visible) {
					btnHTML += `
						<button class="btn-mini btn-warning btnRestore" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">回迁</button>
					`;
				}
				if (row.deleteAsset_visible) {
					btnHTML += `
						<button class="btn-mini btn-danger btnDelete" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">删除</button>
					`;
				}
				return btnHTML;
			}
		}
	],
	api: opg.api.contentList,
	onAjaxEnd: (data) => {
		list = data.results;
	},
	pagination: {
		pageSize: 10
	}
});

//view detail
tb.tbody.on('click', '.btnView', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id'), idx = btn.data('idx');
	let row = list[idx];
	cache.set('currentRow', row);
	//console.log(list , list[idx]);

	let buttons: any = {};
	let fns = [];


	if (row.reTranscode_visible) {
		buttons.reTranscode = {
			className: 'btn-warning',
			text: '再转码',
		};
		fns.push(function (pop, ifr) {
			new ReTranscode(row);
		});
	}

	if (row.reAudit_visible || (row.type == 3000 && row.status == 2)) {
		buttons.reAudit = {
			className: 'btn-warning',
			text: '重播重审',
		};
		fns.push(function (pop, ifr) {
			new ReAudit(row);
		});
	}

	if (row.addEpisode_visible) {
		buttons.addEpisode = {
			className: 'btn-primary',
			text: '添加剧集',
		};
		fns.push(function (pop, ifr) {
			new AddEpisode(id);
		});
	}

	buttons.returnBtn = {
		className: 'btn',
		text: '返回',
	};


	let pop = top.opg(`<iframe src="/page/produce/launch/view.html?id=${id}" allowfullscreen />`).popup({
		title: title,
		btnMax: true,
		width: 900,
		height: 500,
		buttons: buttons,
		callback: function (i, ifr, clicked) {
			//console.log(i, ifr, clicked);
			if (fns[i]) {
				fns[i](pop, ifr);
				return true;
			}
		},
		onDestroy: function () {
			console.log('--- remove ---');
			cache.remove('currentRow');
		}
	});
	pop.toggle();
	//cache.set('currentViewWindow', pop);
});


//重新转码
tb.tbody.on('click', '.btnReTranscode', function () {
	let btn = $(this),
		title = btn.data('title'),
		id = btn.data('id'),
		idx = btn.data('idx');

	let row = list[idx];

	new ReTranscode(row);

});

//重播重审
tb.tbody.on('click', '.btnReAudit', function () {
	let btn = $(this),
		title = btn.data('title'),
		id = btn.data('id'),
		idx = btn.data('idx');

	let row = list[idx];

	new ReAudit(row);

});

//回迁
tb.tbody.on('click', '.btnRestore', function () {
	let btn = $(this),
		title = btn.data('title'),
		id = btn.data('id');

	top.opg(`<iframe src="/page/produce/launch/module/fileRestore/index.html?id=${id}" allowfullscreen />`).popup({
		title: '文件推送',
		btnMax: true,
		width: 980,
		height: 500,
		buttons: {
			btn1: '磁带回迁',
			btn2: {
				className: 'btn-info',
				text: '确定',
			},
			cancel: '返回',
		},
		callback: function (i, ifr) {
			if (i < 2) {
				ifr.doSave(i);
				return true;
			}
			else
				return false;
		},
	}).toggle();

});

//

//添加剧集
tb.tbody.on('click', '.btnAddEpisode', function () {
	let btn = $(this),
		title = btn.data('title'),
		id = btn.data('id');

	new AddEpisode(id);

});


//Modify Time
tb.tbody.on('click', '.btnModifyTime', function () {
	let btn = $(this),
		title = btn.data('title'),
		time = btn.data('time'),
		id = btn.data('id'),
		idx = btn.data('idx');

	let row = list[idx];

	new ValidTimeModifier(id, title, row, tb);

});


//delete
tb.tbody.on('click', '.btnDelete', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.danger(`要删除“<b>${title}</b>”吗？`, function () {
		opg.api.delete({id: id}, () => tb.update());
	}, {
		title: '请确认'
	});
});

//Add new
$('#btnAdd').click(function () {
	let pop = top.opg.confirm(`<iframe src="/page/produce/launch/createNew.html" />`, function (i, ifr) {
		//debugger;
		//console.log(i , ifr , v);
		ifr.doSave(pop, tb);
		return true;
	}, {
		title: '新内容生产需求',
		btnMax: true,
		width: 900,
		height: 500,
		buttons: {
			ok: '保存新增',
			cancel: '取消'
		}
	});
	//pop.toggle();

});