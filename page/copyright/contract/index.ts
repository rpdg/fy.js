import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";

import Contract from './contract';

opg.api({
	'mainCategory!!': 'copyright/programType/findProgramtype',
	'subCategory!!': 'copyright/programType/findProgramtype/${parentId}',
	contracts: 'copyright/program/findPage',
	'delete!DELETE!': 'content/contentType/delete/${id}'
});


const infoPage = '/page/content/contentType/info.html';

//wrap as search panel
let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '合同列表',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

//click to search
panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
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
let tb: Table = opg('#tb').table({
	api: opg.api.contracts,
	columns: [
		{
			text: ' ',
			src: 'id',
			cmd : 'checkAll',
		},
		{
			text: '节目名称',
			src: 'name',
		},
		{
			text: '合同号',
			src: 'name'
		},
		{
			text: '节目英文名',
			src: 'name'
		},
		{
			text: '版权方',
			src: 'name',
		},
		{
			text: '节目许可证号',
			src: 'name',
		},
		{
			text: '节目主类',
			src: 'name',
			width: 100,
		},
		{
			text: '节目子类',
			src: 'name',
			width: 100,
		},
		{
			text: '合同签订日期',
			src: 'name',
			width: 90,
		},
		{
			text: '更新时间',
			src: 'name',
			width: 90,
		},
		{
			text: '操作',
			src: 'name',
			width: 170,
			render: (val, i, row) => {
				return `
					<button class="btn-mini btn-info btnEdit" data-pid="${row.pid}" data-cid="${val}" data-title="${row.name}">修改</button>
					<button class="btn-mini btn-warning btnEditTime" data-pid="${row.pid}" data-cid="${val}" data-title="${row.name}">版权时间</button>
					<button class="btn-mini btn-danger btnDelete" data-pid="${row.pid}" data-cid="${val}" data-title="${row.name}">删除</button>
				`;
			}
		},
	],
	pagination: {
		pageSize: 10
	}
});

let btnBatchButton = $('#btnBatchDelete,#btnModifyContractNumber');

tb.table.on('change' , ':checkbox' , function () {
	let checkedCount: number = $(':checkbox:checked' , tb.tbody).length ;
	btnBatchButton.prop('disabled' , !(checkedCount>0));
});


tb.table.on('click' , '.btnEdit' , function () {
	let btn = $(this),
		title = btn.data('title'),
		contractId = btn.data('cid'),
		programId = btn.data('pid');
	Contract.editProgram(contractId , programId , tb);
});


tb.table.on('click' , '.btnEditTime' , function () {
	let btn = $(this),
		title = btn.data('title'),
		contractId = btn.data('cid'),
		programId = btn.data('pid');
	Contract.modifyCopyrightTime(contractId , programId);
});


$('#btnAdd').click(function () {
	Contract.add(tb);
});


$('#btnBatchImport').click(function () {
	Contract.importExcel();
});