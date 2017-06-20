import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import PopUp from "ts/ui/Popup";
import {store, Cache} from 'ts/util/store';

opg.api({
	'updateCopyrightTime!post' : 'copyright/contract/updateCopyrightContractTime'
});



let cache = Cache.getInstance();
const contract = cache.get('contract') ;
console.log(contract);

$('#programName').text(contract.programName);
$('#contractNumber').text(contract.contractNumber);
$('#copyrightTypeDesc').text(contract.copyrightTypeDesc);

$('#copyrightRealBeginDate').val(contract.copyrightRealBeginDate?contract.copyrightRealBeginDate.split(' ')[0]:'').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}) ;

$('#copyrightRealEndDate').val(contract.copyrightRealEndDate?contract.copyrightRealEndDate.split(' ')[0]:'').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d'
}) ;



window['doSave'] = function (pop:PopUp , tb :Table) {
	let param = $('#tbForm').fieldsToJson({});

	if(!param.copyrightRealEndDate)
		delete param.copyrightRealEndDate;
	else
	 	param.copyrightRealEndDate += ' 00:00:00';

	if(!param.copyrightRealBeginDate)
		delete param.copyrightRealBeginDate;
	else
	 	param.copyrightRealBeginDate += ' 00:00:00';

	if(param){
		param.relContractProgramId = contract.relCopyrightProgramId;
		opg.api.updateCopyrightTime(param , ()=> {
			tb.update();
			pop.close();
		});
	}
};