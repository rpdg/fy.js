import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {Cache} from 'ts/util/store'

opg.api({
	programs: 'admin/catalog/findPage' ,
	contracts : 'transcode/business/findAll'
});


let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '节目查询',
	btnSearchText: '<i class="ico-find"></i> 查询',
	btnSearchClick: function () {
		let param = $('#tbSearch').fieldsToJson();
		param.pageNo = 1;
		tb.update(param);
	}
});


//
let guid: Function = (function () {
	let seed = 0;
	return function (): number {
		return ++seed;
	}
})();
let tb: Table = opg('#tbResult').table({
	api: opg.api.programs,
	titleBar: {
		title: '节目列表',
	},
	columns: [
		{
			text: ' ',
			src: 'name', cmd: 'checkOne'
		},
		{
			text: '节目名称',
			src: 'assetName',
			render: function (val, i, row) {
				return `<b class="ico-expandable ellipse" data-esd="${row.id}"></b> ${val}`;
			}
		},
		{
			text: '节目别名',
			src: 'assetName',
		},
		{
			text: '节目英文名',
			src: 'name',
		},
		{
			text: '节目主类',
			src: 'name',
		},
		{
			text: '节目子类',
			src: 'name',
		},
	],
	pagination: {
		pageSize: 10
	},
});

//expand subTable
tb.tbody.on('click', '.ico-expandable', function (e) {

	let cur = $(this), esd = cur.data('esd');
	let tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		opg.api.contracts({id: esd}, function (data) {
			if(data.results && data.results.length){
				let th = $(`<tr class="subTHead esd_${esd}">
						<th></th><th>录入时间</th><th>合同号</th>
						<th>版权类型</th><th>版权开始时间</th><th>版权结束时间</th>
					</tr>`).insertAfter(tr);

				th.bindList({
					list: data.results ,
					template: '<tr class="subTBody esd_' + esd + '">' +
					'<td></td><td>${id}</td><td>${name}</td>' +
					'<td>${id}</td><td>${id}</td><td>${name}</td>' +
					'</tr>',
					mode: 'after'
				});

				cur.toggleClass('ellipse expanded');
			}
			else{
				opg.alert('没有版权信息');
			}
		})
	}
	else {
		cur.toggleClass('ellipse expanded');
		tr.nextAll('.esd_' + esd).remove();
	}

});

window['getChecked'] = function () {
	let row = tb.getCheckData();
	if(!row){
		opg.warn('请选择节目');
	}
	return row;
};