import opg from 'ts/opg.ts';
import Table from 'ts/ui/Table.ts';

import {store, Cache} from 'ts/util/store';

import Contract from './contract'; //bl


opg.api({
	'mainCategory!!': 'copyright/programType/findProgramtype',
	'subCategory!!': 'copyright/programType/findProgramtype/${parentId}',
	contracts: 'copyright/contract/findPage',
});


//wrap as search panel
opg.wrapPanel('#tbSearch', {
	title: '合同列表',
	btnSearchText: '<i class="ico-find"></i> 查询',
	btnSearchClick: function () {
		let param = $('#tbSearch').fieldsToJson();
		param.pageNo = 1;
		//console.log(panel.jq, param);
		tb.update(param);
	},
});


let selMainCategory = opg('#mainCategory').listBox({
	api: opg.api.mainCategory,
	text: 'programType',
	onSelect: () => {
		let parentId = selMainCategory.getValue();
		if (!parentId) parentId = -1;
		selSubCatagory.update({parentId});
	},
});
let selSubCatagory = opg('#minorCategory').listBox({
	lazy: true,
	api: opg.api.subCategory,
	text: 'programType',
});


let list = [];
//create a data table
let tb: Table = opg('#tb').table({
	api: opg.api.contracts,
	onAjaxEnd: (data) => {
		list = data.results ;
	},
	rows : {
		render : (val , i, row)=>{
			if (row.contractStatus == -1)
				return ' hilight';
			return '';
		}
	},
	columns: [
		{
			text: '<input type="checkbox" id="chkAll_chk_c" value="">',
			src: 'relCopyrightProgramId',
			width: 32,
			render: function (val, i, row) {
				if (row.contractStatus == -1)
					return `<input type="checkbox" name="chk_c" value="${i}">`;
				return '';
			},
		},
		{
			text: '节目名称',
			src: 'programName',
		},
		{
			text: '合同号',
			src: 'contractNumber',
		},
		{
			text: '节目英文名',
			src: 'enName',
		},
		{
			text: '版权方',
			src: 'copyrightOwner',
		},
		{
			text: '节目许可证号',
			src: 'licenseNnumber',
		},
		{
			text: '节目主类',
			src: 'mainCategoryStr',
			width: 80,
		},
		{
			text: '节目子类',
			src: 'minorCategoryStr',
			width: 80,
		},
		{
			text: '合同签订日期',
			src: 'contractDate',
			width: 90,
			render : d=> d ? d.split(' ')[0]: d ,
		},
		{
			text: '更新时间',
			src: 'changeDate',
			width: 90,
			render : d=> d ? d.split(' ')[0]: d ,
		},
		{
			text: '操作',
			src: 'id',
			width: 240,
			align: 'left',
			render: (val, i, row) => {
				let html = `
					<button class="btn-mini btn-info btnEdit" data-rid="${row.relCopyrightProgramId}" data-pid="${row.programId}" data-title="${row.programName}" data-cnum="${row.contractNumber}">修改</button>
					<button class="btn-mini btn-info btnEditTime" data-rid="${row.relCopyrightProgramId}" data-title="${row.programName}" data-idx="${row[':index']}">版权时间</button>
					<button class="btn-mini btn-danger btnDelete" data-rid="${row.relCopyrightProgramId}" data-title="${row.programName}">删除</button>
				`;
				if (row.contractStatus == -1)
					html += `<button class="btn-mini btn-warning btnChange" data-rid="${row.relCopyrightProgramId}" data-cnum="${row.contractNumber}">变更合同号</button>`;

				return html;
			},
		},
	],
	pagination: {
		pageSize: 10,
	},
	onUpdate: function () {
		chkAll_chk_c.prop('checked', false);
		btnBatchButton.prop('disabled', true);
	},
});

let chkAll_chk_c = $('#chkAll_chk_c');
chkAll_chk_c.syncCheckBoxGroup(':checkbox:enabled', tb.tbody);


let btnBatchButton = $('#btnBatchDelete,#btnModifyContractNumber');

tb.table.on('change', ':checkbox', function () {
	let checkedCount: number = $(':checkbox:checked', tb.tbody).length;
	btnBatchButton.prop('disabled', !(checkedCount > 0));
});

//批量修改合同号
$('#btnModifyContractNumber').on('click', function () {
	Contract.batchModifyContractNumber(tb);
});

//单个修改合同号
tb.table.on('click', '.btnChange', function () {
	let btn = $(this),
		contractNumber = btn.data('cnum'),
		relContractProgramId = btn.data('rid');
	Contract.modifyContractNumber([relContractProgramId], [contractNumber], tb);
});

//批量删除
$('#btnBatchDelete').on('click', function () {
	Contract.deleteContracts(tb);
});

//单个删除
tb.table.on('click', '.btnDelete', function () {
	let btn = $(this),
		title = btn.data('title'),
		relContractProgramId = btn.data('rid');
	Contract.deleteContractsById([relContractProgramId], [title], tb);
});

//合同详情修改
tb.table.on('click', '.btnEdit', function () {
	let btn = $(this),
		title = btn.data('title'),
		relContractProgramId = btn.data('rid') ;

	Contract.editProgram(relContractProgramId, tb , Contract.modify);
});


//修改版权时间
tb.table.on('click', '.btnEditTime', function () {
	let btn = $(this),
		title = btn.data('title'),
		idx = btn.data('idx');

	let row = list[idx];
	Contract.modifyCopyrightTime(row, tb);
});

//新增
$('#btnAdd').click(function () {
	Contract.add(tb);
});

//导入
$('#btnBatchImport').click(function () {
	Contract.importExcel(tb);
});


//导出
$('#btnExportAll').click(function () {
	Contract.exportAll();
});