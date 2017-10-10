import opg from 'ts/opg.ts';
import {Combo} from 'ts/ui/Combo' ;
import Popup from 'ts/ui/Popup';
import Table from 'ts/ui/Table';

opg.api({
	business: 'transcode/business/findAll', //业务
	contentType: 'content/contentType/findAll', //内容类型
	region: 'admin/content/region/queryAll', //地域
	movieTypes: 'base/requireMovieTypes', //介质类型
	movieProfiles: 'base/requireMovieProfiles', //视频风格
	risk: 'base/requireRisk', //危险系数
	'contentCategory!GET!': 'admin/content/category/contentCategory/${id}', //根据内容类型获取栏目
	'newAsset!POST': 'produce/asset/newAsset', //新增内容
});

opg.api.newAsset.set('timeOut', 600000);//10分钟

//集数区间
let iptEpisodeNum = $('#episodeNum');
let episodeStart = $('#episodeStart').decimalMask('9999');
let episodeEnd = $('#episodeEnd').decimalMask('9999');

let countEpisode = function () {
	let s = +episodeStart.val() || 0;
	let e = +episodeEnd.val() || 0;
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

/*$('#showName').on('focus', function () {
	let v = this.value, n = $('#managerName').val();
	if (!v && n) {
		this.value = n;
	}
});*/

$('#managerName').on('input change', function () {
	$('#showName').val(this.value);
});


//上线时间
$('#onlineTime').datetimepicker({
	closeOnDateSelect: true,
	format: 'Y-m-d H:i:00',
});

//业务
let busiCodesList = opg('#tdBusiness').checkBox({
	api: opg.api.business,
	name: 'busiCodesList[]',
	value: 'bizCode',
	labelClass: 'lbWidth150',
	onCreate: () => {
		let busiChksAll, busiChksLocal, busiChksCloud;

		busiChksAll = busiCodesList.jq.find(':checkbox');

		busiChksAll.each((i, elem) => {
			if (elem.value.indexOf('cloud') > -1) {
				elem.className = 'chkCloud';
			}
			else {
				elem.className = 'chkLocal';
			}
		});

		busiChksLocal = busiCodesList.jq.find('.chkLocal');
		busiChksCloud = busiCodesList.jq.find('.chkCloud');

		busiChksLocal.on('change', function () {
			let localChked = busiCodesList.jq.find('.chkLocal:checked');
			console.log(localChked);
			busiChksCloud.prop('disabled', !!localChked.length);
		});

		busiChksCloud.on('change', function () {
			let cloudChked = busiCodesList.jq.find('.chkCloud:checked');
			console.log(cloudChked);
			busiChksLocal.prop('disabled', !!cloudChked.length);
		});

		//console.log(busiChksAll, busiChksLocal , busiChksCloud);
	},
});


//内容类型
let contentTypeHash = {};
let selContentType = opg('#contentType').listBox({
	api: opg.api.contentType,
	onAjaxEnd: (data) => {
		contentTypeHash = opg.convert.arrayToHash(data.results, 'id');
	},
	onSelect: () => {
		let id = selContentType.getValue();
		if (!id) id = -1;
		//
		selContentCategory.update({id});
	},
});

//栏目
let selContentCategory = opg('#category').listBox({
	api: opg.api.contentCategory,
	lazy: true,
	value: 'name',
});

//介质类型
opg.api.movieTypes((data) => {
	let arr = [];
	for (let key in data) {
		arr.push({id: key, name: data[key]});
	}
	opg('#movieType').listBox({
		data: arr,
	});
});


//视频风格
opg.api.movieProfiles((data) => {
	let arr = [];
	for (let key in data) {
		arr.push({id: key, name: data[key]});
	}
	opg('#profile').listBox({
		data: arr,
	});
});


//危险系数
opg.api.risk((data) => {
	let arr = [];
	for (let key in data) {
		arr.push({id: key, name: data[key]});
	}
	opg('#risk').listBox({
		data: arr,
	});
});


//地域
opg('#region').listBox({
	api: opg.api.region,
	text: 'name',
	value: 'name',
});


//关联版权
let copyrightProgramName = $('#copyrightProgramName');
let copyrightProgramId = $('#copyrightProgramId');
$('#btnCopyrightProgram').click(function () {
	top.opg.confirm(`<iframe src="/page/produce/launch/copyright.html" />`, function (i, ifr) {
		let row = ifr.getChecked();

		console.warn(row);

		if (row) {
			copyrightProgramName.val(row.name);
			copyrightProgramId.val(row.id);
		}
		return !row;
	}, {
		title: '关联版权',
		btnMax: true,
		width: 800,
		height: 600,
	});
});
Combo.makeClearableInput(copyrightProgramName, copyrightProgramId);

$('#programLength').decimalMask('99999999');

//
window['doSave'] = function (pop: Popup, tb: Table, parentWin: Window) {
	let param = $('#tbForm').fieldsToJson({
		managerName: {
			require: true,
			name: '内容名称',
		},
		showName: {
			require: true,
			name: '展示名称',
		},
		contentType: {
			require: true,
			name: '内容类型',
		},
		onlineTime: {
			require: true,
			type: 'date',
			name: '上线时间',
		},
		programLength: {
			require: true,
			name: '预估单集时长',
			type: 'int',
		},
		movieType: {
			require: true,
			name: '介质类型',
		},
		profile: {
			require: true,
			name: '视频风格',
		},
		busiCodesList: {
			require: true,
			name: '可添加的业务',
		},
	});
	if (param) {
		param.processType = 'NewAsset'; // 新增内容


		if (param.seriesFlag != '1') param.seriesFlag = '0';
		param.collectAudit = (param.collectAudit == '1');
		param.collectCatalog = (param.collectCatalog == '1');
		param.collectAudit3 = (param.collectAudit3 == '1');

		param.contentType = contentTypeHash[param.contentType].name;

		if (param.onlineTime.indexOf(' ') == -1)
			param.onlineTime += ' 00:00:00';

		console.log(param);


		opg.api.newAsset(param, (data) => {
			pop.close();
			tb.update();
			parentWin['doCatalog'](data.assetId, data.id, param.managerName);
		});
	}
};