import ops from 'ts/ops.ts';
import {Combo} from 'ts/ui/Combo' ;

ops.api({
	amssp: 'system/amssp/findAll',
	businessList: 'transcode/business/findAll',
	movietype: 'system/movietype/findAll',
});


let ids = ops.request['id'] ? ops.request['id'].split(',') : null;
let tabs = [
	{label: '元数据', view: '#d1'},
	{label: '图片文件', view: '#d2'}
];

if (ids && ids.length > 1) {
	tabs.push({
		label: '批量编目工单',
		view: '#d3'
	});
	$('.forSingleFileOnly').remove();
}
else {
	$('#d3').remove();
	$('.forSingleFileOnly').show();
}

ops('#mainTab').tabView({data: tabs});


$('#validTime,#expireTime,#copyrightValidTime,#copyrightExpireTime').datetimepicker({
	//timepicker:false,
	format: 'Y-m-d H:i'
});

$('#originDate').datetimepicker({
	timepicker: false,
	format: 'Y-m-d'
});


function makeInputOnlyCheckmate(txtIpt, valIpt, arr, valAttrSrc, popSets) {

	Combo.makeClearableInput(txtIpt, valIpt);

	let opsCheck = ops('<div class="divPopWrapper"></div>').checkBox({
		data: arr,
		value: valAttrSrc,
		onCreate: function () {

			txtIpt.on('click', function () {
				opsCheck.selectedData = valIpt.val().split(',');

				ops.confirm(opsCheck.jq, function () {
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


	set checkWin(win: any) {
		this._checkWin = win;
	}

	get checkWin(): any {
		return this._checkWin;
	}
}

let checkedInfo = window['checkedInfo'] = new CheckedInfo();

$.when(
	//子类别
	ops.api.amssp(data => {
		makeInputOnlyCheckmate($('#genre'), $('#genreId'), data.results, 'code', {
			title: `子类别`,
			width: 580,
			height: 300,
		});
	}),
	//标签
	ops.api.businessList(data => {
		makeInputOnlyCheckmate($('#tags'), $('#tagsId'), data, 'id', {
			title: `标签`,
			width: 580,
			height: 300,
		});
	}),
).then(() => {
	console.log(arguments);
	//内容分组
	$('#groupNames').on('click', () => {

		checkedInfo.checkWin = ops(`<iframe src="/page/produce/catalog/groupCheck.html" />`).popup({
			title: '所属节目分组',
			width: 560,
			height: 460,
		});

	});

	//分类
	$('#categoryNames').on('click', () => {
		checkedInfo.checkWin = ops(`<iframe src="/page/produce/catalog/categoryCheck.html" />`).popup({
			title: '选择分类',
			width: 460,
			height: 460,
			buttons : {
				OK : '确定',
				Clear : {
					className : 'btn-warning' , text : '清除'
				},
				Cancel : '返回',
			},
			callback : function(i, ifrWin){
				switch (i){
					case 0:{
						checkedInfo.category = ifrWin.getSelectedData();
						break;
					}
					case 1:{
						ifrWin.clearSelectedData();
						return true;
						break;
					}
					default:{
					}
				}
			}
		});
	});
});








