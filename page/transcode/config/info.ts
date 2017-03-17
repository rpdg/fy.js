import opg from 'ts/opg.ts';

let id = opg.request['id'];

opg.api({
	'findById!!': 'transcode/business/findById/${id}',
	'add!post': 'transcode/bizProfile/add' ,

	business: 'transcode/business/findAll' ,
	sourceTypes: 'base/sourceTypes' ,
	outTypes: 'base/outTypes' ,
	movietype: 'system/movietype/findAll' ,
});


//业务名称
opg('#businessId').listBox({
	api : opg.api.business ,
});


//输入类别
opg('#inputSourceType').listBox({
	api : opg.api.sourceTypes ,
	value : 'code'
});


//
opg.api.movietype(data=>{
	const cfg = {
		data : data ,
		value  :'movieType'
	};

	opg('#inputFileMovieType').listBox(cfg);
	opg('#outputFileMovieType').listBox(cfg);
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

	return opg.api[action](param, function () {
		popWin.close();
		table.update();
	});

};
