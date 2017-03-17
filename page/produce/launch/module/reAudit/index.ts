import opg from 'ts/opg.ts';
import {Combo} from 'ts/ui/Combo' ;


opg.api({
	business: 'transcode/business/findAll', //业务
});

//上线时间
$('#onlineTime').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d',
});



window['doSave'] = function () {
	let param = $('#tbForm').fieldsToJson({
		onlineTime: {
			name: '上线时间',
			type: 'date',
			require: true,
		},
	});
	if(!param) return;

	console.log(param);
};