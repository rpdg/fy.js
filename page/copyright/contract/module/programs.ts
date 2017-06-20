import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";


opg.api({
	'mainCategory!!': 'copyright/programType/findProgramtype',
	'subCategory!!': 'copyright/programType/findProgramtype/${parentId}',
	programs: 'copyright/program/findPage',
});



//wrap as search panel
opg.wrapPanel('#tbSearch', {
	title: '节目查询',
	btnSearchText: '<i class="ico-find"></i> 查询',
	btnSearchClick : function () {
		let param = $('#tbSearch').fieldsToJson();
		param.pageNo = 1;
		//console.log(panel.jq, param);
		tb.update(param);
	}
});



let selMainCategory = opg('#mainCategory').listBox({
	api: opg.api.mainCategory,
	text: 'programType',
	onSelect: () => {
		let parentId = selMainCategory.getValue();
		if (!parentId) parentId = -1;
		selSubCatagory.update({parentId});
	}
});
let selSubCatagory = opg('#minorCategory').listBox({
	lazy: true,
	api: opg.api.subCategory,
	text: 'programType',
});




//create a data table
let tb: Table = opg('#tbResult').table({
	api: opg.api.programs,
	columns: [
		{
			text: ' ',
			src: 'id',
			cmd: 'checkOne',
		},
		{
			text: '节目名称',
			src: 'name',
		},
		{
			text: '节目别名',
			src: 'alias',
		},
		{
			text: '节目英文名',
			src: 'enName'
		},
		{
			text: '节目主类',
			src: 'mainCategoryDesc',
			width: 100,
		},
		{
			text: '节目子类',
			src: 'minorCategoryDesc',
			width: 100,
		},
		{
			text: '集数',
			src: 'episodes',
			width: 60,
		},
		{
			text: '出品年代',
			src: 'produceYear',
			width: 90,
		},
	],
	pagination: {
		pageSize: 10
	}
});



window['getChecked'] = function () {
	let row = tb.getCheckData();
	if(!row){
		opg.warn('请选择节目');
	}

	return row;
};