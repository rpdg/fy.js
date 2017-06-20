import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {Cache} from 'ts/util/store'

opg.api({
	authRegion: 'copyright/authRegion/findPage?pageSize=100000' , //地域
	authRegion2: 'copyright/authRegion/findPage?pageSize=100000' , //二级地域
});


let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '地域查询',
	btnSearchText: '<i class="ico-find"></i> 查询',
	btnSearchClick: function () {
		let param = $('#tbSearch').fieldsToJson();
		param.pageNo = 1;
		tb.update(param);
	}
});


let tb: Table = opg('#tbResult').table({
	api: opg.api.authRegion,
	titleBar: {
		title: '地域列表',
	},
	columns: [
		{
			text: ' ',
			src: 'id', cmd: 'checkAll'
		},
		{
			text: '地域名称',
			src: 'name',
			render: function (val, i, row) {
				if(row.regionType==0)
					return `<b class="ico-expandable ellipse" data-esd="${row.regionId}"></b> ${val}`;
				return val;
			}
		},
		{
			text: '根/二级地域',
			src: 'regionType',
			width: 150,
			render: function (val) {
				return val==0?'根域':'二级地域';
			}
		},
	],
});


//expand subTable
tb.tbody.on('click', '.ico-expandable', function (e) {

	let cur = $(this), parentId = cur.data('esd');
	let tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		opg.api.authRegion2({parentId}, function (data) {
			if(data.results && data.results.length){
				let th = $(`<tr class="subTHead esd_${parentId}">
						<th></th><th>二级地域名</th><th>二级地域</th>
					</tr>`).insertAfter(tr);

				th.bindList({
					list: data.results ,
					template: '<tr class="subTBody esd_' + parentId + '">' +
					'<td></td><td class="text-center">${name}</td><td class="text-center">${regionType:=renderType}</td>' +
					'</tr>',
					mode: 'after',
					itemRender: {
						renderType : function (val) {
							return val==0?'根域':'二级地域';
						}
					}
				});

				cur.toggleClass('ellipse expanded');
			}
			else{
				opg.alert('没有二级地域');
			}
		})
	}
	else {
		cur.toggleClass('ellipse expanded');
		tr.nextAll('.esd_' + parentId).remove();
	}

});

window['getChecked'] = function () {
	let rows = tb.getCheckData();
	if(!rows){
		opg.warn('请选择地域');
	}

	return rows;
};

