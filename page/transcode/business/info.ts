import opg from 'ts/opg.ts';

const id = ~~opg.request['id'];

opg.api({
	'findById!!': 'transcode/business/findById/${id}',
	'update!post': 'transcode/business/update',
	'add!post': 'transcode/business/add'
});



let form = $('#tbProfile');

if (id) {
	opg.api.findById({id: opg.request['id']}, function (data) {
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

	return opg.api[action](param, function () {
		popWin.close();
		table.update();
	});

};
