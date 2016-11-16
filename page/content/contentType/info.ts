import ops from 'ts/ops.ts';

let id = ops.request['id'] ;
ops.api({
	'findById!!': 'content/contentType/findById/${id}',
	'update!post' : 'content/contentType/update' ,
	'add!post' : 'content/contentType/add'
});

const codes = {
	'content_contentType_name_empty' : '节目类型名称为空',
	'content_contenttype_name_existed' : '节目类型名称已存在',
};

ops.api.add.set('codes', codes);
ops.api.update.set('codes', codes);



let form = $('#tbSearch');
if(id){
	ops.api.findById({id : ops.request['id']} , function (data) {
		form.jsonToFields(data);
	});
}



window['doSave'] = function (popWin , table) {

	let action,
		param = form.fieldsToJson({
			name: {
				name: '节目类型名称',
				type : 'ns',
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
