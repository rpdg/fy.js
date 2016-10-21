import ops from 'ts/ops.ts';

var id = ops.request['id'] ;
ops.api({
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

ops.api.add.set('codes', codes);
ops.api.update.set('codes', codes);



var form = $('#tbSearch');
if(id){
	ops.api.findById({id : ops.request['id']} , function (data) {
		form.jsonToFields(data);
	});
}



window['doSave'] = function (popWin , table) {

	var action,
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

	param.parentId = ops.request['parentId'];
	param.orgStatus = 0;

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
