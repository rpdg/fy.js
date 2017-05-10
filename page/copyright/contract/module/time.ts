import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import PopUp from "ts/ui/Popup";

opg.api({

});


$('#copyrightRealBeginDate').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}) ;

$('#copyrightRealEndDate').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}) ;



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