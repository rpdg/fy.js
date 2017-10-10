import opg from 'ts/opg.ts';

const id = opg.request['id'];
const form = $('#tbSearch');


opg.api({
	produceRuleTypes: 'base/produceRuleTypes', //规则类型
	produceTypes: 'base/produceProcessTypes', //生产类型
	business: 'transcode/business/findAll', //生产业务
	transcodePolicys: 'base/transcodePolicys', //转码模式
	transcodePrioritys: 'base/transcodePrioritys', //转码优先级
	sourceTypes: 'base/sourceTypes', //节目来源
	transcodeEnvs: 'base/transcodeEnvs', //转码环境
	storageTypes: 'base/storageTypes', //存储类型
	'findById!!': 'produce/rule/${id}', //获取规则元数据
	'upsert!post': 'produce/rule/saveRule',
});

let dynTrs = $('#tbSearch > tbody > tr');
let toggleData = [{id: 1, name: '是'}, {id: 0, name: '否'}];


let produceRuleTypes ;
$.when(
	//规则类型
	produceRuleTypes = opg('#produceRuleTypes').listBox({
		api: opg.api.produceRuleTypes,
		autoPrependBlank: false,
		onAjaxEnd: function (json) {
			json.results = opg.convert.hashToArray(json, (val, key) => {
				return {name: val, code: key};
			});
			console.log('111111', json);
		},
		value: 'code',
		onSelect: function () {
			dynTrs.hide();
			let v = +this.getValue();
			//debugger;
			switch (v) {
				case 1:
					$('#tr_produceType,#tr_1').show();
					break;
				case 2:
					$('#tr_2-1,#tr_2-2').show();
					break;
				case 3:
					$('#tr_produceType,#tr_3').show();
					break;
				case 4:
					$('#tr_produceType,#tr_4').show();
					break;
				case 5:
					$('#tr_produceType,#tr_business').show();
					break;
				case 6:
					$('#tr_sourceTypes,#tr_6-2').show();
					break;
				case 7:
					$('#tr_storageTypes,#tr_business').show();
					break;
				case 8:
					$('#tr_storageTypes,#tr_sourceTypes').show();
					break;
				default:
			}
		},
	}).createdPromise,
).done(function () {
	console.log(222222);

	$.when(
		opg('#catalog').listBox({
			data: toggleData,
		}).createdPromise,

		opg('#backup').listBox({
			data: toggleData,
		}).createdPromise,

		opg('#audit').listBox({
			data: toggleData,
		}).createdPromise,

		//生产类型
		opg('#tbd1_produceType').checkBox({
			api: opg.api.produceTypes,
			name: 'produceTypes',
			value: 'code',
			onAjaxEnd: (json) => {
				json.results = opg.convert.hashToArray(json, (val, key) => {
					return {name: val, code: key};
				});
				//console.log(json);
			},
		}).createdPromise,

		//生产业务
		opg('#td_busiCodes').checkBox({
			api: opg.api.business,
			name: 'busiCodes',
			value: 'bizCode',
		}).createdPromise,

		//节目来源
		opg('#td_sourceTypes').checkBox({
			api: opg.api.sourceTypes,
			name: 'source',
			value: 'code',
		}).createdPromise,

		//转码环境
		opg('#td_transcodeEnvs').radioBox({
			api: opg.api.transcodeEnvs,
			name: 'transcodeEnv',
			value: 'code',
			onAjaxEnd: (json) => {
				json.results = opg.convert.hashToArray(json, (val, key) => {
					return {name: val, code: key};
				});
				//console.log(json);
			},
		}).createdPromise,

		//转码模式
		opg('#transcodePolicys').listBox({
			api: opg.api.transcodePolicys,
			value: 'code',
			onAjaxEnd: (json) => {
				json.results = opg.convert.hashToArray(json, (val, key) => {
					return {name: val, code: key};
				});
			},
		}).createdPromise,

		//转码优先级
		opg('#transcodePrioritys').listBox({
			api: opg.api.transcodePrioritys,
			value: 'code',
			onAjaxEnd: (json) => {
				json.results = opg.convert.hashToArray(json, (val, key) => {
					return {name: val, code: key};
				});
			},
		}).createdPromise,

		//存储类型
		opg('#storageTypes').listBox({
			api: opg.api.storageTypes,
			value: 'code',
			autoPrependBlank: false,
			onAjaxEnd: (json) => {
				json.results = opg.convert.hashToArray(json, (val, key) => {
					return {name: val, code: key};
				});
			},
		}).createdPromise,

	).done(function () {
		console.log(555);
		if (id) {
			opg.api.findById({id: opg.request['id']}, function (data) {
				/**/
				if (data.produceTypes)
					data.produceTypes = data.produceTypes.split(',');

				if (data.busiCodes)
					data.busiCodes = data.busiCodes.split(',');

				if (data.source)
					data.source = data.source.split(',');


				//produceRuleTypes.selectedIndex =
				form.jsonToFields(data);

				$('#produceRuleTypes').trigger('change.opg');

				/*setTimeout(function () {
					console.log(111);
					form.jsonToFields(data);
				} , 200);*/


			});
		}


	});

});


window['doSave'] = function (popWin, table) {

	let iptName = $('#name') , vName = iptName.val();
	if(!vName){
		return iptName.iptError('规则名称不可为空');
	}
	else if((/[`~!@#$%\^&\*\+=\{\};"'<>\?,\.]/gim).test(vName)){
		return iptName.iptError('规则名称不可含特殊字符');
	}

	$('#tbSearch > tbody > tr:hidden').remove();

	let param = form.fieldsToJson({
		name: {
			name: '规则名称',
			type: 'ns',
			require: true,
		},
	});

	if (!param)
		return true;


	for (let key in param) {
		let val = param[key];

		if (val === '') {
			delete param[key];
			continue;
		}

		if ($.isNumeric(val)) {
			param[key] = +val;
		}
		else if (opg.is.Array(val)) {
			console.log(key, val);
			param[key] = val.join(',');
		}
	}


	if (id) {

		let blankParam = {
			'id': id,
			'produceTypes': '',
			'needCatalog': '',
			'needAudit': '',
			'needBackup': '',
			'busiCodes': '',
			'transcodePolicy': '',
			'transcodePriority': '',
			'transcodeEnv': '',
			'storeId': '',
			'source': '',
		};

		param = $.extend(blankParam, param);
	}

	console.log('param', param);
	//return true;

	return opg.api.upsert(param, function () {
		popWin.close();
		table.update();
	});

};
