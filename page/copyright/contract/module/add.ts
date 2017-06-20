import opg from 'ts/opg.ts';
import {store, Cache} from 'ts/util/store';
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import PopUp from "ts/ui/Popup";

import Contract from '../contract';


const contractId = opg.request['contractId'];
let contractNumber ;

opg.api({
	findCopyrightContractWithPrograms : 'copyright/contract/findCopyrightContractWithPrograms?contractId=' + contractId ,
	'save!post' : 'copyright/contract/updateContract',
});



$('#contractDate').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
});

//let isFirstLoad = true ;

//create a data table
let tb: Table = opg('#tb').table({
	api: opg.api.findCopyrightContractWithPrograms,
	arrSrc : 'copyrightPrograms' ,
	onAjaxEnd: (data)=>{
		data.totalRecord = data.propramTotal;
		console.warn(data);
		//if(isFirstLoad){
			//isFirstLoad = false;
			contractNumber = data.contractNumber ;

			if(data.contractDate)
				data.contractDate = data.contractDate.split(' ')[0];

			$('#tbSearch').jsonToFields(data);
		//}
	},
	columns: [
		{
			text: '节目主类',
			src: 'mainCategoryStr',
			width: 100,
		},
		{
			text: '节目子类',
			src: 'minorCategoryStr',
			width: 100,
		},
		{
			text: '节目名称',
			src: 'programName',
		},
		{
			text: '节目别名',
			src: 'alias'
		},
		{
			text: '集数',
			src: 'episodes',
			width: 50,
		},
		{
			text: '版权开始日',
			src: 'copyrightBeginDate',
			width: 90,
			render : (d)=>{
				if(d)
					return d.split(' ')[0];
				return d;
			},
		},
		{
			text: '版权到期日',
			src: 'copyrightEndDate',
			width: 90,
			render : (d)=>{
				if(d)
					return d.split(' ')[0];
				return d;
			},
		},
		{
			text: '操作',
			src: 'relCopyrightProgramId',
			width: 110,
			render: (val, i, row) => {
				return `
					<button class="btn-mini btn-info btnEdit" data-rid="${val}" data-title="${row.programName}">修改</button>
					<button class="btn-mini btn-danger btnDelete" data-rid="${val}" data-title="${row.programName}">删除</button>
				`;
			}
		},
	],
	pagination: true,
});



//编辑
tb.table.on('click' , '.btnEdit' , function () {
	let btn = $(this),
		title = btn.data('title'),
		relContractProgramId = btn.data('rid');
	Contract.editProgram(relContractProgramId , tb);
});


//增加
$('#btnAdd').click(function () {
	Contract.addProgram(contractId , contractNumber , tb);
});



//单个删除
tb.table.on('click', '.btnDelete', function () {
	let btn = $(this),
		title = btn.data('title'),
		relContractProgramId = btn.data('rid');
	Contract.deleteContractsById([relContractProgramId], [title], tb);
});


//保存
$('#btnSave').click(function () {
	let param = $('#tbSearch').fieldsToJson({
		contractNumber: {
			name: '合同号',
			require: true ,
		},
	});

	if(param){
		param.contractId = contractId ;
		delete param.contractTotalAmount ;

		if(param.contractDate)
			param.contractDate += ' 00:00:00';

		console.log(param);

		opg.api.save(param , ()=>{
			opg.ok(`合同"${param.contractNumber}"修改成功` , closeSelfWindow) ;
		});
	}
});

//取消
$('#btnCancel').click(closeSelfWindow);


function closeSelfWindow(){
	let cache = Cache.getInstance();
	let pop :PopUp = cache.get('currentPop') as PopUp ;
	pop.close();
}