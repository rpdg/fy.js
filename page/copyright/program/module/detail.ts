import opg from 'ts/opg.ts';


opg.api({
	'mainCategory!!': 'copyright/programType/findProgramtype',
	'subCategory!!': 'copyright/programType/findProgramtype/${parentId}',
	'findById!!': 'transcode/business/findById/${id}',
});


let selMainCategory = opg('#mainCategory').listBox({
	api: opg.api.mainCategory,
	text: 'programType',
	onSelect: () => {
		let parentId = selMainCategory.getValue();
		if (!parentId) parentId = -1;
		selSubCatagory.update({parentId});
	}
});
let selSubCatagory = opg('#minorCategory').listBox({
	lazy: true,
	api: opg.api.subCategory,
	text: 'programType',
});


const id = opg.request['id'];

const form = $('#tbProfile');


if (id) {
	opg.api.findById({id: opg.request['id']}, function (data) {
		form.jsonToFields(data);
	});
}



window['doSave'] = function (popWin, table) {

	let action,
		param = form.fieldsToJson({
			name: {
				name: '节目名称',
				require: true
			},
			mainCategory: {
				name: '节目主类',
				require: true
			},
			produceYear: {
				name: '出品年代',
				require: true
			},
			episodes: {
				name: '集数',
				type : 'number',
				require: true
			},
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
