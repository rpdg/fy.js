import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {Cache} from 'ts/util/store'

opg.api({
	programs: 'copyright/program/findPage' ,
	contracts : 'copyright/program/findProgramContract/${programId}',
	'mainCategory!!' : 'copyright/programType/findProgramtype',
	'subCategory!!' : 'copyright/programType/findProgramtype/${parentId}',
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

let selMainCategory = opg('#mainCategory').listBox({
	api : opg.api.mainCategory ,
	text : 'programType' ,
	onSelect:()=>{
		let parentId = selMainCategory.getValue();
		if(!parentId) parentId=-1;
		selSubCatagory.update({parentId});
	}
});
let selSubCatagory = opg('#minorCategory').listBox({
	lazy: true ,
	api : opg.api.subCategory ,
	text : 'programType' ,
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
			src: 'id', cmd: 'checkOne'
		},
		{
			text: '节目名称',
			src: 'name',
			render: function (val, i, row) {
				return `<b class="ico-expandable ellipse" data-esd="${row.id}"></b> ${val}`;
			}
		},
		{
			text: '节目别名',
			src: 'alias',
		},
		{
			text: '节目英文名',
			src: 'enName',
		},
		{
			text: '节目主类',
			src: 'mainCategoryDesc',
		},
		{
			text: '节目子类',
			src: 'minorCategoryDesc',
		},
	],
	pagination: {
		pageSize: 10
	},
});

//expand subTable
tb.tbody.on('click', '.ico-expandable', function (e) {

	let cur = $(this), programId = cur.data('esd');
	let tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		opg.api.contracts({programId}, function (data) {
			if(data && data.length){
				let th = $(`<tr class="subTHead esd_${programId}">
						<th></th><th>录入时间</th><th>合同号</th>
						<th>版权类型</th><th>版权开始时间</th><th>版权结束时间</th>
					</tr>`).insertAfter(tr);

				th.bindList({
					list: data ,
					template: '<tr class="subTBody esd_' + programId + '">' +
						'<td></td><td class="text-center">${createDate:=gDate}</td><td class="text-center">${contract:=gCtr}</td>' +
						'<td class="text-center">${copyrightTypeDesc}</td><td class="text-center">${copyrightBeginDate:=gDate}</td><td class="text-center">${copyrightEndDate:=gDate}</td>' +
						'</tr>',
					itemRender:{
						gCtr : function (contract){
							if(contract)
								return contract.contractNumber;
							return '';
						},
						gDate : function (d){
							return `${d.split(' ')[0]}`;
						}
					},
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
		tr.nextAll('.esd_' + programId).remove();
	}

});

window['getChecked'] = function () {
	let row = tb.getCheckData();
	if(!row){
		opg.warn('请选择节目');
	}

	return row;
};