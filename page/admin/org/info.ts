import opg from 'ts/opg.ts';

let id = opg.request['id'] ;
opg.api({
	'findById!!': 'system/organization/findById/${id}',
	'update!post' : 'system/organization/update' ,
	'add!post' : 'system/organization/add'
});

const codes = {
	'system_amsorganization_name_empty' : '组织名称为空',
	'system_amsorganization_code_empty' : '组织代码为空',
	'system_amsorganization_name_existed' : '组织名称已被占用',
	'system_amsorganization_code_existed' : '组织代码已被占用',
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
			orgName: {
				name: '组织名称',
				type : 'ns',
				require: true
			},
			orgCode: {
				name: '组织编码',
				type : 'ns',
				require: true
			}
		});


	if (!param)
		return true;

	param.parentId = opg.request['parentId'];
	param.orgStatus = 0;

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
