import ops from 'ts/ops';

let id = ops.request['id'];
ops.api({
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

ops.api.add.set('codes', codes);
ops.api.update.set('codes', codes);


let form = $('#tbSearch');


$.when(
	ops.api.amssp(data => {
		ops('#spCode').listBox({
			data: data,
			value: 'code'
		});
	}),
	ops.api.sourcetype(data => {
		ops('#sourceType').listBox({
			data: data ,
			value : 'code'
		});
	})
).done(()=> {
	if (id) {
		ops.api.findById({id: id}, function (data) {
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

	return ops.api[action](param, function () {
		popWin.close();
		table.update();
	});

};
