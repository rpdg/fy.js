import ops from 'ts/ops.ts';

let id = ops.request['id'];

ops.api({
	'findById!!': 'transcode/bizProfile/findById/${id}',
});

const form = $('#tbProfile');
if (id) {
	ops.api.findById({id: ops.request['id']}, function (data) {
		form.jsonToFields(data);
	});
}
