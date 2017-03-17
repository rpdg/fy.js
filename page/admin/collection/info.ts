import opg from 'ts/opg';

let id = opg.request['id'];
opg.api({
	amssp: 'system/amssp/findAll',
	sourcetype: 'base/sourceTypes',
	'findById!!': 'system/collection/findById/${id}',
	'update!post': 'system/collection/update',
	'add!post': 'system/collection/add'
});

const codes = {
	'system_amssp_name_empty': '内容生产商名称为空',
	'system_amssp_code_empty': '内容生产商代码为空',
	'system_amssp_name_existed': '内容生产商名称已被占用',
	'system_amssp_code_existed': '内容生产商代码已被占用',
};

opg.api.add.set('codes', codes);
opg.api.update.set('codes', codes);


let form = $('#tbSearch');


$.when(
	opg.api.amssp(data => {
		opg('#spCode').listBox({
			data: data,
			value: 'code'
		});
	}),
	opg.api.sourcetype(data => {
		opg('#sourceType').listBox({
			data: data ,
			value : 'code'
		});
	})
).done(()=> {
	if (id) {
		opg.api.findById({id: id}, function (data) {
			form.jsonToFields(data);
		});
	}
});


window['doSave'] = function (popWin, table) {

	let action,
		param = form.fieldsToJson({
			name: {
				name: '采集源名称',
				type: 'ns',
				require: true
			},
			code: {
				name: '采集源编码',
				type: 'ns',
				require: true
			},
			spCode: {
				name: '内容生产商',
				require: true
			}
		});

	if (!param)
		return true;


	if (id) {
		param.id = id;
		action = 'update';
	}
	else {
		action = 'add';
	}

	return opg.api[action](param, function () {
		popWin.close();
		table.update();
	});

};
