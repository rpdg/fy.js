import ops from 'ts/ops.ts';

var id = ops.request['id'];
ops.api({
	'findById!!': 'transcode/business/findById/${id}',
	'update!post': 'transcode/business/update',
	'add!post': 'transcode/business/add'
});

const codes = {
	'transcode_business_name_empty': '业务名称为空',
	'transcode_business_code_empty': '业务代码为空',
	'transcode_business_name_existed': '业务名称已被占用',
	'transcode_business_code_existed': '业务代码已被占用',
};

ops.api.add.set('codes', codes);
ops.api.update.set('codes', codes);


var form = $('#tbSearch');
if (id) {
	ops.api.findById({id: ops.request['id']}, function (data) {
		form.jsonToFields(data);
	});
}


window['doSave'] = function (popWin, table) {

	var action,
		param = form.fieldsToJson({
			name: {
				name: '业务名称',
				type: 'ns',
				require: true
			},
			bizCode: {
				name: '业务编码',
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

	return ops.api[action](param, function () {
		popWin.close();
		table.update();
	});

};
