import opg from 'ts/opg.ts';
import {Combo} from 'ts/ui/Combo' ;
import Popup from "ts/ui/Popup";
import Table from "ts/ui/Table";

opg.api({
	business: 'transcode/business/findAll', //业务
	episodesInfo: 'produce/asset/toAddEpisodes/${assetId}',//剧头信息
	risk: 'base/requireRisk', //危险系数
	'newAsset!POST': 'produce/asset/newAsset', //新增内容
});

const assetId = +opg.request['assetId'];
let programInfo;

//集数区间
let episodeStart = $('#episodeStart').decimalMask('9999');
let episodeEnd = $('#episodeEnd').decimalMask('9999');


//上线时间
$('#onlineTime').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d',
});


/*
 */

//危险系数
let selRisk = opg.api.risk((data) => {
	let arr = [];
	for (let key in data) {
		arr.push({id: key, name: data[key]});
	}
	opg('#risk').listBox({
		data: arr,
	});
});
//$.when(selRisk.createdPromise).done(function () {

opg.api.episodesInfo({assetId}, (data) => {
	programInfo = data;

	//业务
	opg('#tdBusiness').checkBox({
		name: 'busiCodesList[]',
		data: data.businessStatus,
		value: 'busiCode',
		text: 'busiName',
		labelClass: 'lbWidth150',
	}).jq.find(':checkbox').prop('checked', true);

	for (let attr in data) {
		$(document.getElementById(attr)).text(`${data[attr]}`);
	}
	$('#onlineTime').val(data['onlineTime'].split(' ')[0]);

});

//});


//关联版权
let programMediaFileName = $('#programMediaFileName');
let programMediaFileId = $('#programMediaFileId');
$('#btnProgramMediaName').click(function () {
	top.opg.confirm(`<iframe src="/page/produce/launch/copyrightMedium.html" />`, function (i, ifr) {
		let row = ifr.getChecked();
		if (row) {
			programMediaFileName.val(row.name);
			programMediaFileId.val(row.id);
		}
		return !row;
	}, {
		title: '选择版权介质',
		btnMax: true,
		width: 990,
		height: 600,
	});
});

Combo.makeClearableInput(programMediaFileName, programMediaFileId);


//
window['doSave'] = function (pop: Popup, tb: Table, parentWin: Window) {
	let param = $('#tbForm').fieldsToJson({
		onlineTime: {
			require: true,
			type: 'date',
			name: '上线时间',
		},
		episodeStart: {
			require: true,
			type: 'number',
			name: '起始集数',
		},
		episodeEnd: {
			require: true,
			type: 'number',
			name: '结束集数',
		},
		busiCodesList: {
			require: true,
			name: '业务',
		},


	});
	if (param) {
		if (param.episodeEnd < param.episodeStart)
			return opg.warn('结束集数应大等于开始集数');

		for (let i = param.episodeStart, l = param.episodeEnd + 1; i < l; i++) {
			if (programInfo.producedEpisodes.indexOf(i)>-1)
				return opg.warn('新增的剧集含已生产集数');
		}

		param.processType = 'NewAsset'; // 新增内容
		param.assetId = assetId;
		param.episodeNum = param.episodeEnd - param.episodeStart + 1;
		param.seriesFlag = 1;

		/*param.managerName = programInfo.managerName;
		 param.showName = programInfo.showName;
		 param.contentType = programInfo.contentType;
		 param.programLength = programInfo.programLength;
		 param.movieType = programInfo.movieType;
		 param.profile = programInfo.profile;*/

		if (param.onlineTime.indexOf(' 00:00:00') == -1)
			param.onlineTime += ' 00:00:00';


		param.collectAudit = (param.collectAudit == '1');
		param.collectCatalog = (param.collectCatalog == '1');
		param.collectAudit3 = (param.collectAudit3 == '1');


		for (let key in programInfo) {
			if (param[key] === undefined) {
				param[key] = programInfo[key];
			}
		}
		delete param.producedEpisodes;
		delete param.businessStatus;
		delete param.busiCodes;
		delete param.profileDesc;
		delete param.movieTypeDesc;

		if (param.programMediaFileId)
			param.programMediaFileId = +param.programMediaFileId;

		console.log(param);


		opg.api.newAsset(param, (data) => {
			pop.close();
			tb.update();
			parentWin['doCatalog'](data.assetId, data.id, param.managerName);
		});
	}
};