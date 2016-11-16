import ops from 'ts/ops.ts';

let id = ops.request['id'];

ops.api({
	'findById!!': 'transcode/business/findById/${id}',
	'add!post': 'transcode/bizProfile/add' ,

	business: 'transcode/business/findAll' ,
	sourceTypes: 'base/sourceTypes' ,
	outTypes: 'base/outTypes' ,
	movietype: 'system/movietype/findAll' ,
});


//业务名称
ops('#businessId').listBox({
	api : ops.api.business ,
});


//输入类别
ops('#inputSourceType').listBox({
	api : ops.api.sourceTypes ,
	value : 'code'
});


//
ops.api.movietype(data=>{
	const cfg = {
		data : data ,
		value  :'movieType'
	};

	ops('#inputFileMovieType').listBox(cfg);
	ops('#outputFileMovieType').listBox(cfg);
});


const form = $('#tbProfile');


window['doSave'] = function (popWin, table) {

	let action,
		param = form.fieldsToJson({
			businessId: {
				name: '业务名称',
				type : 'number',
				require: true
			},
			inputSourceType: {
				name: '输入类别',
				type : 'number',
				require: true
			},
			inputFileMovieType: {
				name: '输入源文件类型',
				type : 'number',
				require: true
			},
			outputFileMovieType: {
				name: '输出文件类型',
				type : 'number',
				require: true
			},
			outputDefinitionType: {
				name: '输出类别',
				type : 'number',
				require: true
			},
			suffix:{
				name: '文件后缀',
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
