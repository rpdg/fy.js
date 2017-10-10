import opg from 'ts/opg.ts';

const id = opg.request['id'];
const form = $('#tbInfo');



opg.api({
	storageTypes: 'base/storageTypes', //存储类型
	'findById!!': 'storage/${id}', //获取规则元数据
	'upsert!post': 'storage/saveStorage',
});


$.when(
	//类型
	opg('#type').listBox({
		api: opg.api.storageTypes,
		autoPrependBlank : false ,
		onAjaxEnd: (json) => {
			json.results = opg.convert.hashToArray(json, (val, key) => {
				return {name: val, id: key};
			});
		},
	})
).done(function () {
	if (id) {
		opg.api.findById({id}, function (data) {
			form.jsonToFields(data);
		});
	}
});


window['doSave'] = function (popWin, table) {
	let param = form.fieldsToJson({
		name: {
			name: '存储名称',
			type: 'ns',
			require: true,
		},
		code: {
			name: '存储Code',
			type: 'ns',
			require: true,
		},
		path: {
			name: '存储地址',
			type: 'string',
			require: true,
		},
	});

	if (!param)
		return true;

	if (id) {
		param.id = id ;
	}

	console.log('param', param);

	return opg.api.upsert(param, function () {
		popWin.close();
		table.update();
	});
};