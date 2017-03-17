import opg from 'ts/opg.ts';

let id = opg.request['id'];

opg.api({
	'findById!!': 'transcode/bizProfile/findById/${id}',
});

const form = $('#tbProfile');
if (id) {
	opg.api.findById({id: opg.request['id']}, function (data) {
		form.jsonToFields(data);
	});
}
