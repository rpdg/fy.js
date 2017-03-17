import opg from 'ts/opg.ts';

let id = opg.request['id'];
opg.api({
	'findById!!': 'system/amssp/findById/${id}',
	'update!post': 'system/amssp/update',
	'add!post': 'system/amssp/add'
});

const codes = {
	'system_amssp_name_empty': '内容生产商名称为空',
	'system_amssp_code_empty': '内容生产商代码为空',
	'system_amssp_name_existed': '内容生产商名称已被占用',
	'system_amssp_code_existed': '内容生产商名称已被占用',
};

opg.api.add.set('codes', codes);
opg.api.update.set('codes', codes);


let form = $('#tbSearch');
if (id) {
	opg.api.findById({id: opg.request['id']}, function (data) {
		form.jsonToFields(data);
	});
}


window['doSave'] = function (popWin, table) {

	let action,
		param = form.fieldsToJson({
			name: {
				name: '内容生产商名称',
				type: 'ns',
				require: true
			},
			code: {
				name: '内容生产商编码',
				type: 'ns',
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
