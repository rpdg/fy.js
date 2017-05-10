import opg from 'ts/opg.ts';
import {store, Cache} from 'ts/util/store';
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import PopUp from "ts/ui/Popup";

import Contract from '../contract';


opg.api({
	programs : 'copyright/program/findPage',
});


const contractId = opg.request['id'];

$('#contractDate').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
});


//create a data table
let tb: Table = opg('#tb').table({
	api: opg.api.programs,
	columns: [
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
			text: '节目名称',
			src: 'name',
		},
		{
			text: '节目别名',
			src: 'name'
		},
		{
			text: '集数',
			src: 'name',
			width: 50,
		},
		{
			text: '版权开始日',
			src: 'name',
			width: 90,
		},
		{
			text: '版权到期日',
			src: 'name',
			width: 90,
		},
		{
			text: '操作',
			src: 'name',
			width: 110,
			render: (val, i, row) => {
				return `
					<button class="btn-mini btn-info btnEdit" data-id="${val}" data-title="${row.name}">修改</button>
					<button class="btn-mini btn-danger btnDelete" data-id="${val}" data-title="${row.name}">删除</button>
				`;
			}
		},
	],
	pagination: true,
});




tb.table.on('click' , '.btnEdit' , function () {
	let btn = $(this),
		title = btn.data('title'),
		programId = btn.data('id');
	Contract.editProgram(contractId , programId , tb);
});



$('#btnAdd').click(function () {
	Contract.addProgram(contractId , tb);
});



$('#btnCancel').click(function () {
	let cache = Cache.getInstance();
	let pop :PopUp = cache.get('currentPop') as PopUp ;
	pop.close();
});




window['doSave'] = function (pop:PopUp , nextStep :Function , tb :Table) {
	let param = $('#tbForm').fieldsToJson({
		contractNumber: {
			name: '合同号',
			require: true ,
		},
	});

	if(param){
		let id = '123333';
		pop.close();
		nextStep(id , tb);
	}
};