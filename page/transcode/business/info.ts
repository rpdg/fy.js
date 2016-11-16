import ops from 'ts/ops.ts';

const id = ~~ops.request['id'];

ops.api({
	'findById!!': 'transcode/business/findById/${id}',
	'update!post': 'transcode/business/update',
	'add!post': 'transcode/business/add'
});



let form = $('#tbProfile');

if (id) {
	ops.api.findById({id: ops.request['id']}, function (data) {
		form.jsonToFields(data);
	});
}


window['doSave'] = function (popWin, table) {

	let action,
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
