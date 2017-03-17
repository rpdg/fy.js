import opg from 'ts/opg.ts';

let id = opg.request['id'] ;
opg.api({
	'findById!!': 'content/contentType/findById/${id}',
	'update!post' : 'content/contentType/update' ,
	'add!post' : 'content/contentType/add'
});

const codes = {
	'content_contentType_name_empty' : '节目类型名称为空',
	'content_contenttype_name_existed' : '节目类型名称已存在',
};

opg.api.add.set('codes', codes);
opg.api.update.set('codes', codes);



let form = $('#tbSearch');
if(id){
	opg.api.findById({id : opg.request['id']} , function (data) {
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

	return opg.api[action](param, function () {
		popWin.close();
		table.update();
	});

};
