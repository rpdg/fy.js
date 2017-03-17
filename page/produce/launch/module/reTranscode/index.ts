import opg from 'ts/opg.ts';
import {Combo} from 'ts/ui/Combo' ;


opg.api({
	business: 'transcode/business/findAll', //业务
	produced: 'produced/${id}', //已生产剧集
});

const id = opg.request['id'], type = opg.request['type'];
const isEpisode  = (type==3000) ;

if(isEpisode){
	$('#trEpisode').show();

	//已生产剧集
	opg('#tdBusiness').checkBox({
		name: 'episode[]',
		api: opg.api.produced,
	});
}

//上线时间
$('#onlineTime').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d',
});

//业务
opg('#tdBusiness').checkBox({
	name: 'busiCodes[]',
	api: opg.api.business,
});





window['doSave'] = function () {
	let param = $('#tbForm').fieldsToJson({
		onlineTime: {
			name: '上线时间',
			type: 'date',
			require: true,
		},
		busiCodes : {
			name: '业务',
			type : 'number[]',
			require: true,
		},
	});
	if(!param) return;
	if (param.onlineTime) param.onlineTime += ' 00:00:00';

	console.log(param);
};