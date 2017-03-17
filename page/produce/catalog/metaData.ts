import opg from 'ts/opg.ts';
import {Combo} from 'ts/ui/Combo' ;
import {Cache} from 'ts/util/store' ;
import PopUp from "ts/ui/Popup";
import Table from "ts/ui/Table";

opg.api({
	getCatalog: 'admin/catalog/getCatalog', //获取单个编目数据
	category: 'admin/content/category/queryAll', //栏目
	genres: 'admin/content/rel/queryContentGenres', //子类别
	tags: 'admin/content/rel/queryContentTags', //标签
	contentUsages: 'base/contentUsages', //用途
	copyRightTypes: 'base/copyRightTypes', //版权类型
	priceTypes: 'base/priceTypes', //资费类型
	serialSourceTypes: 'base/serialSourceTypes', //节目源类型
	starLevels: 'base/programStarLevels', //推荐级别
	ratings: 'base/programRatings', //限制级别
	region: 'admin/content/region/queryAll', //地域
	company: 'admin/content/company/queryAll', //版权内容提供商
	languages: 'base/languages', //语言
	pics: 'admin/content/picture/getAssetPics', //images
	'saveCatalog!post': 'admin/catalog/updateCatalog', //保存元数据
	'saveBatchCatalog!post': 'admin/catalog/batchUpdateCatalog', //批量保存元数据
});

let progInfo: any;

let cache = Cache.getInstance();
let batchData = cache.get('checkedBatchCategory');
const assetId = opg.request['assetId'];

let tabs = [
	{label: '元数据', view: '#d1'},
	{label: '图片文件', view: '#d2'}
];

if (batchData) {
	tabs.push({
		label: '批量编目工单',
		view: '#d3'
	});
	//$('.forSingleFileOnly').hide();
	opg('#tb3').table({
		data: batchData,
		columns: [
			{
				text: '内容名称', width: 220,
				src: 'assetName'
			},
			{
				text: '内容类型', width: 120,
				src: 'contentType'
			},

			{
				text: '创建时间', width: 150,
				src: 'createTime'
			},
			{
				text: '创建人', width: 120,
				src: 'creator'
			},
		]
	});
}
else {
	$('#d3').remove();
	$('.forSingleFileOnly').show();
}

opg('#mainTab').tabView({data: tabs});

$('#episodeNumber').decimalMask('9999');
$.when(
	//栏目Category
	opg.api.category(function (data) {
		opg('#category').listBox({
			data: data,
			value: 'name'
		});
	}),

	//用途
	opg.api.contentUsages(function (data) {
		opg('#vodArrange').listBox({
			data: opg.convert.hashToArray(data, (v, k) => {
				return {id: k, name: v}
			}),
		});
	}),

	//版权类型
	opg.api.copyRightTypes(function (data) {
		opg('#copyrightType').listBox({
			data: opg.convert.hashToArray(data, (v, k) => {
				return {id: k, name: v}
			}),
		});
	}),

	//资费类型
	opg.api.priceTypes(function (data) {
		opg('#defaultPriceType').listBox({
			data: opg.convert.hashToArray(data, (v, k) => {
				return {id: k, name: v}
			}),
		});
	}),

	//节目源类型
	opg.api.serialSourceTypes(function (data) {
		opg('#sourceType').listBox({
			data: opg.convert.hashToArray(data, (v, k) => {
				return {id: k, name: v}
			}),
		});
	}),

	//推荐级别
	opg.api.starLevels(function (data) {
		opg('#starLevel').listBox({
			data: opg.convert.hashToArray(data, (v, k) => {
				return {id: k, name: v}
			}),
		});
	}),


	//限制级别
	opg.api.ratings(function (data) {
		opg('#rating').listBox({
			data: opg.convert.hashToArray(data, (v, k) => {
				return {id: k, name: v}
			}),
		});
	}),

	//地域
	opg.api.region(function (data) {
		opg('#region').listBox({
			data: data,
			text: 'name',
			value: 'name',
		});
	}),

	//内容提供商
	opg.api.company(function (data) {
		opg('#company').listBox({
			data: data,
			text: 'name',
			value: 'name',
		});
	}),


	//语言
	opg.api.languages(function (data) {
		opg('#language').listBox({
			data: opg.convert.hashToArray(data, (v, k) => {
				return {id: v, name: v}
			}),
		});
	}),
).then(() => {

	//Meta data
	opg.api.getCatalog({assetId: assetId}, function (data) {
		bindMetaData(data);
		initSubChooser(data);
	});
	//Pics
	opg.api.pics({assetId: assetId}, function (data) {
		window['loadImages'](data);
	});
});

let hasImages = 0;
window['loadImages'] = function (data: any, msg?: string) {
	for (let key in data) {
		hasImages++;
		(document.getElementById(`img_${key}`) as HTMLImageElement).src = (data[key]['path'] || data[key]) + '?' + Math.random();
	}

	$('#msgH3').text(msg || '');

	if (msg) {
		opg.warn(msg);
	}
};

$('#validTime,#expireTime,#copyrightValidTime,#copyrightExpireTime').each(function (i , elem) {
	$(elem).datetimepicker({
		//timepicker:false,
		format: 'Y-m-d H:i:00'
	})
});

$('#originDate').datetimepicker({
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d',
});


function makeInputOnlyCheckmate(btn , txtIpt, valIpt, arr = [], valAttrSrc, popSets) {

	Combo.makeClearableInput(txtIpt, valIpt);

	let opsCheck = opg('<div class="divPopWrapper"></div>').checkBox({
		data: arr,
		value: valAttrSrc,
		onCreate: function () {

			btn.on('click', function () {
				opsCheck.selectedData = valIpt.val().split(',');

				opg.confirm(opsCheck.jq, function () {
					txtIpt.val(opsCheck.getText().join(','));
					valIpt.val(opsCheck.getValue().join(','));
					this.close();
				}, popSets);

			});

		}
	});
}


class CheckedInfo {

	private _groups: Array;
	private _iptGroupName: JQuery;
	private _iptGroupId: JQuery;


	private _category: Array;
	private _iptCategoryName: JQuery;
	private _iptCategoryId: JQuery;

	private _checkWin: any;

	constructor() {
		this._groups = [];
		this._category = [];
		this._checkWin = {};

		this._iptGroupName = $('#groupNames');
		this._iptGroupId = $('#groupIds');

		this._iptCategoryName = $('#categoryNames');
		this._iptCategoryId = $('#categoryIds');
	}

	set groups(arr: Array) {
		this._groups = arr;

		let arrIds = [];
		let arrName = [];
		arr.map((obj, i) => {
			arrIds.push(obj.id);
			arrName.push(obj.name);
		});

		this._iptGroupName.val(arrName.join(','));
		this._iptGroupId.val(arrIds.join(','));
	}

	get groups(): Array {
		return this._groups;
	}


	set category(arr: Array) {
		this._category = arr;

		let arrIds = [];
		let arrName = [];
		arr.map((obj, i) => {
			arrIds.push(obj.id);
			arrName.push(obj.name);
		});

		this._iptCategoryName.val(arrName.join(','));
		this._iptCategoryId.val(arrIds.join(','));
	}

	get category(): Array {
		return this._category;
	}


	setArrays(idsString: string = '', namesString: string = '', forGroup: boolean = true) {
		let arr = [];

		if (idsString) {
			let ids = idsString.split(',');
			let names = namesString.split(',');
			ids.map((id, i) => {
				arr.push({
					id: id,
					name: names[i],
				})
			});
		}

		if (forGroup)
			this.groups = arr;
		else
			this.category = arr
	}

	set checkWin(win: any) {
		this._checkWin = win;
	}

	get checkWin(): any {
		return this._checkWin;
	}
}


function initSubChooser(progInfo: any) {

	let checkedInfo = window['checkedInfo'] = new CheckedInfo();

	checkedInfo.setArrays(progInfo.groupIds, progInfo.groupNames, true);
	checkedInfo.setArrays(progInfo.categoryIds, progInfo.categoryNames, false);

	$.when(
		//子类别
		opg.api.genres({contentTypeName: progInfo.contentType}, data => {
			makeInputOnlyCheckmate($('#btnGenre') , $('#genreNames'), $('#genreIds'), data, 'id', {
				title: `子类别`,
				width: 580,
				height: 300,
			});
		}),
		//标签
		opg.api.tags({contentTypeName: progInfo.contentType}, data => {
			makeInputOnlyCheckmate($('#btnTag'),$('#tagNames'), $('#tagIds'), data, 'id', {
				title: `标签`,
				width: 580,
				height: 300,
			});
		}),
	).then(() => {
		console.log(arguments);
		//内容分组
		$('#btnGroups').on('click', () => {

			checkedInfo.checkWin = opg(`<iframe src="/page/produce/catalog/groupCheck.html" />`).popup({
				title: '所属节目分组',
				width: 560,
				height: 460,
			});

		});

		//分类
		$('#btnCategory').on('click', () => {
			checkedInfo.checkWin = opg(`<iframe src="/page/produce/catalog/categoryCheck.html" />`).popup({
				title: '选择分类',
				width: 460,
				height: 460,
				buttons: {
					OK: '确定',
					Clear: {
						className: 'btn-warning', text: '清除'
					},
					Cancel: '返回',
				},
				callback: function (i, ifrWin) {
					switch (i) {
						case 0: {
							checkedInfo.category = ifrWin.getSelectedData();
							break;
						}
						case 1: {
							ifrWin.clearSelectedData();
							return true;
							break;
						}
						default: {
						}
					}
				}
			});
		});
	});
}


function bindMetaData(data) {
	if (!data.seconds) {
		data.seconds = data.length;
		data.length = opg.format.timeLength(data.seconds);
	}

	renameAttr(data, 'tags', 'tagIds');
	renameAttr(data, 'genre', 'genreIds');

	if (data.originDate) data.originDate = data.originDate.split(' ')[0];
	if(!data.episodeNumber) data.episodeNumber = 1;

	console.log(data);
	progInfo = data;


	$('#d1').jsonToFields(data);

	$('#progType').text(data.typeName);
	$('#contentType').text(data.contentType);
	$('#length').text(data.length);

	//todo:可能会有扩展类别
	if (data.type != 1000) {
		$('.forOne').find('*').css('visibility', 'visible');
	}
	else {
		$('.forOne').find('*').css('visibility', 'hidden');
	}
}

//导入
$('.btn-copy').click(function () {
	let pop = opg(`<iframe src="/page/produce/catalog/copyInfo.html" />`).popup({
		title: '编目工单查询',
		width: 680,
		height: 460,
		btnMax: true,
	});


	cache.set('importWin', pop);
});
window['importMetaData'] = function (assetId) {
	opg.api.getCatalog({assetId}, function (data) {
		data['managerName'] = progInfo.managerName;
		data['oriName'] = progInfo.oriName;
		data['sortName'] = progInfo.sortName;
		data['srarchName'] = progInfo.srarchName;

		bindMetaData(data);
	})
};


//豆瓣导入
$('.btn-douban').click(function () {
	let pop = opg(`<iframe src="/page/produce/catalog/douban.html" />`).popup({
		title: '豆瓣查询',
		width: 720,
		height: 480,
		btnMax: true,
		onDestroy: function () {
			cache.remove('windowSrc');
			cache.remove('importWin');
		}
	});

	let cache = Cache.getInstance();
	cache.set('importWin', pop);
	cache.set('windowSrc', window);
});
window['importDbData'] = function (data) {
	if (data.type != 1000) {
		progInfo.keyword = data.keyword;
		progInfo.episodeNumber = data.episodeNumber;
	}
	progInfo.type = data.type;
	progInfo.typeName = data.typeName;
	progInfo.writerDisplay = data.writerDisplay;
	progInfo.actorDisplay = data.actorDisplay;
	progInfo.region = data.region;
	progInfo.descirption = data.descirption;
	progInfo.issueYear = data.issueYear;

	bindMetaData(progInfo);
};






//保存元数据
$('.btn-saveMeta').click(function () {
	window['doSave'](false);
});


window['doSave'] = function (flag: boolean, pop?: PopUp, tb?: Table) {
	if(flag && hasImages===0){
		return opg.warn('请处理图片');
	}

	//console.log($('#d1').fieldsToJson());

	let param = $('#d1').fieldsToJson({
		name: {
			name: '节目名称',
			require: true
		},
		sortName: {
			name: '索引名',
			require: true
		},
		srarchName: {
			name: '查询名',
			require: true
		},
		validTime: {
			name: '生效时间',
			type: 'date',
			require: true
		},
		expireTime: {
			name: '失效时间',
			type: 'date',
			require: true
		},
		episodeNumber: {
			name: '总集数',
			type: 'int',
			require: true
		},
		newDay: {
			name: '新到天数',
			type: 'int',
		},
		leftDay: {
			name: '剩余天数',
			type: 'int',
		},
		defaultPrice: {
			name: '默认资费',
			type: 'number',
		},
		issueYear: {
			name: '出品年代',
			type: 'int',
		},
	});

	if(!param) return;

	if(opg.convert.stringToDate(param.expireTime) <= opg.convert.stringToDate(param.validTime)){
		return $('#expireTime').iptError('失效时间应晚于生效时间');
	}

	if(param.issueYear && param.issueYear.toString().length!=4){
		return $('#issueYear').iptError('出品年份应为4位整数');
	}

	param.episodeNumber = parseFloat(param.episodeNumber) || 1;
	param.id = parseFloat(opg.request['assetId']);
	param.orderId = parseFloat(opg.request['orderId']);
	param.length = progInfo.seconds;
	param.passFlag = flag;

	if (param.originDate) param.originDate += ' 00:00:00';

	//renameAttr(param , 'tags' , 'tagIds');
	delete param.tagNames;

	//renameAttr(param, 'genre', 'genreIds');
	//delete param.genreId;
	delete param.genreNames;

	let callback = () => {
		if (tb)
			tb.update();

		if (pop)
			pop.close();
		else{
			opg.ok('元数据信息已保存');
		}
	};

	if (batchData) {
		console.log(batchData);
		let arr = [];
		batchData.map((val, i) => {
			console.log(i, val);
			arr.push({
				id: val['orderId'],
				assetId: val['assetId'],
			});
		});
		param['orders'] = arr;
		opg.api.saveBatchCatalog(param, callback);
	}
	else {
		opg.api.saveCatalog(param, callback);
	}


	console.log(param);
};

function renameAttr(obj: any, srcAttrName: string, toAttrName: string): any {
	if(obj[toAttrName] === undefined){
		let val = obj[srcAttrName];
		delete obj[srcAttrName];
		obj[toAttrName] = val;
		return obj;
	}
	throw new Error('target attribute already be setted');
}

