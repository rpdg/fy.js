import opg from 'ts/opg.ts';
import {Combo} from 'ts/ui/Combo' ;

opg.api({
	business: 'transcode/business/findAll', //业务
});


//集数区间
let episodeStart = $('#episodeStart').decimalMask('9999');
let episodeEnd = $('#episodeEnd').decimalMask('9999');


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


//关联版权
let programMediaName = $('#programMediaName');
let programMediaId = $('#programMediaId');
$('#btnProgramMediaName').click(function () {
	top.opg.confirm(`<iframe src="/page/produce/launch/copyrightMedium.html" />` , function (i, ifr) {
		let row = ifr.getChecked();
		if(row){
			programMediaName.val(row.assetName);
			programMediaId.val(row.assetId);
		}
		return !row;
	} , {
		title: '选择版权介质',
		btnMax : true ,
		width: 800,
		height: 600,
	});
});

Combo.makeClearableInput(programMediaName, programMediaId);


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