import opg from 'ts/opg.ts';
import {Combo} from 'ts/ui/Combo' ;

opg.api({
	business: 'transcode/business/findAll', //业务
	contentType: 'content/contentType/findAll', //内容类型
	region: 'admin/content/region/queryAll', //地域
});


//集数区间
let iptEpisodeNum = $('#episodeNum');
let episodeStart = $('#episodeStart').decimalMask('9999');
let episodeEnd = $('#episodeEnd').decimalMask('9999');
let countEpisode = function () {
	let s = +episodeStart.val()||0;
	let e = +episodeEnd.val()||0;
	if (e >= s) {
		iptEpisodeNum.val(e - s + 1);
	}
};
episodeStart.on('input change blur', countEpisode);
episodeEnd.on('input change blur', countEpisode);
$('#seriesFlag').on('change', function () {
	if (this.checked) {
		episodeStart.prop('disabled', false);
		episodeEnd.prop('disabled', false);
	}
	else {
		episodeStart.prop('disabled', true).val('');
		episodeEnd.prop('disabled', true).val('');
		iptEpisodeNum.val('1');
	}
});

//上线时间
$('#onlineTime').datetimepicker({
	closeOnDateSelect: true,
	format: 'Y-m-d H:i:00',
});

//业务
opg('#tdBusiness').checkBox({
	name: 'busiCodes[]',
	api: opg.api.business,
});

//内容类型
opg('#contentType').listBox({
	api: opg.api.contentType,
	value: 'name',
});

//栏目
opg('#category').listBox({
	data: [],
	value: 'name',
});

//地域
opg('#region').listBox({
	api: opg.api.region,
	text: 'name',
	value: 'name',
});

//关联版权
let copyrightProgram = $('#copyrightProgram');
let copyrightProgramId = $('#copyrightProgramId');
$('#btnCopyrightProgram').click(function () {
	top.opg.confirm(`<iframe src="/page/produce/launch/copyright.html" />` , function (i, ifr) {
		let row = ifr.getChecked();
		if(row){
			copyrightProgram.val(row.assetName);
			copyrightProgramId.val(row.assetId);
		}
		return !row;
	} , {
		title: '关联版权',
		btnMax : true ,
		width: 800,
		height: 600,
	});
});
Combo.makeClearableInput(copyrightProgram, copyrightProgramId);