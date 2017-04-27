import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {store, Cache} from 'ts/util/store';
import PopUp from "ts/ui/Popup";
import AuditPutBack from '../@comm/auditPutBack' ;


let currentUser = store.get('userInfo');

console.log('currentUser', currentUser);

opg.api({
	contentType: 'content/contentType/findAll',
	sourceTypes: 'system/collection/collectSourceEnum',
	audit: 'audit/findPage?stepCode=collect_audit',
	checkAuditPermission: 'audit/checkAuditPermission/${orderId}',  //检查审核权限
	'pass!POST': 'audit/pass',
	'cancelAuditOrder!!': 'audit/cancelAuditOrder/${orderId}',  //取消审核
	'delete!DELETE!': 'transcode/business/delete/${id}',
});


let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '二审工单查询',
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
		title: '二审列表',
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
		/*{
			text: '审片要求',
			src: 'audit2',
			width: 85,
		},*/
		{
			text: '操作人',
			src: 'executor',
			width: 85,
		},
		{
			text: '操作', src: 'orderId', width: 60,
			render: function (val, i, row) {
				if (!row.executor || (row.executor == currentUser.loginName))
					return `<button class="btn-mini btn-warning" data-oid="${val}" data-aid="${row.assetId}" data-title="${row.managerName}" data-idx="${row[':index']}">二审</button>`;
				//return '';
				return `<button class="btn-mini btn-info" data-oid="${val}" data-aid="${row.assetId}" data-title="${row.managerName}" data-idx="${row[':index']}">查看</button>`;
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
	let btn = $(this),
		title = btn.data('title'),
		assetId = btn.data('aid'),
		orderId = btn.data('oid'),
		idx = btn.data('idx') ,
		row = list[idx];

	opg.api.checkAuditPermission({orderId}, function (data) {
		if (data.result) {
			if(!row.executor)
				tb.update();

			let popWin = openInfoWindow(assetId, idx, {
				title: title,
				btnMax: true,
				width: 900,
				height: 500,
				buttons: {
					btnPutBack: {
						className: 'btn-warning',
						text: '打回',
						onClick: function () {
							AuditPutBack.showWindow(2 , orderId , title , popWin , tb);
							return true;
						}
					},
					ok: {
						className: 'btn-success',
						text: '通过',
						onClick: function () {
							let form = $(`<div style="padding: 10px;"><table class="search-table">
							<tr>
								<td class="lead">节目名称</td>
								<td style="width: auto;">${title}</td>
							</tr>
							<tr>
								<td class="lead">生产流程</td>
								<td style="width: auto;">
									<label class="lbAutoWidth"><input type="checkbox" name="collectCatalog" value="1" checked />非编</label>、 
									<label class="lbAutoWidth"><input type="checkbox" name="collectAudit3" value="1" checked />三审</label>
								</td>
							</tr>
						</table></div>`);
							top.opg(form).popup({
								title: '确定通过',
								width: 420,
								height: 200,
								buttons: {
									ok: {
										text: '确定',
										className: 'btn-success',
										onClick: function () {
											let p = this as PopUp;

											let param = form.fieldsToJson();

											param.orderId = orderId;
											param.collectCatalog = (param.collectCatalog == '1');
											param.collectAudit3 = (param.collectAudit3 == '1');

											opg.api.pass(param, () => {
												tb.update();
												p.close();
												popWin.close();
											});

											return true;
										}
									},
									cancel: '返回',
								}
							});

							return true;
						}
					},
					cancel: {
						className: 'btn',
						text: '取消' ,
						onClick : function(){
							opg.api.cancelAuditOrder({orderId} , ()=>{
								tb.update();
								popWin.close();
							});
							return true;
						}
					},
					returnBtn: '返回',
				}
			});
		}
		else{
			opg.alert(data.message , ()=>{
				viewMeta(assetId, title, idx);
			});
		}
	});

});

//view
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), assetId = btn.data('aid'), idx = btn.data('idx');
	viewMeta(assetId, title, idx);
});
function viewMeta(assetId, title, idx) {
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
}

function openInfoWindow(orderId: number | string, index: number, sets: any = {}) {
	cache.set('currentRow', list[index]);
	sets.onDestroy = function () {
		console.log('--- remove ---');
		cache.remove('currentRow');
	};

	console.log(sets);

	return opg.popTop(`<iframe src="/page/produce/audit2/info.html?assetId=${orderId}" allowfullscreen />`, sets).toggle();
}
