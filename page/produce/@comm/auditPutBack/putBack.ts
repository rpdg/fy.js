import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import PopUp from "ts/ui/Popup";


opg.api({
	'putBack!POST': 'audit/back',
});

const orderId = +opg.request['orderId'];
const title = opg.request['title'];
const auditStep = +opg.request['step'];

$('#managerName').text(title);

let backStepCodes;
if (auditStep == 2) {
	backStepCodes = [{id: 'collect', name: '采集'}];
}
else {
	backStepCodes = [
		{id: 'collect', name: '采集'},
		{id: 'collect_audit', name: '二审'},
		{id: 'collect_catalog', name: '非编'},
	];
}

opg('#backStepCode').listBox({
	data: backStepCodes,
	autoPrependBlank: false,
});


window['doPost'] = function (pop: PopUp, parentPop: PopUp, tb: Table) {
	let param = $('#formTb').fieldsToJson();

	if (param) {
		param.orderId = orderId;

		opg.api.putBack(param, data => {
			tb.update();
			opg.ok(data, () => {
				pop.close();
				parentPop.close();
			});
		});
	}
};

