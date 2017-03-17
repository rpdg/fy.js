import opg from 'ts/opg.ts';

opg.api({
	'findById!!': 'system/station/findById/${id}',
	'update!post': 'system/station/update',
	'add!post': 'system/station/add',

	'businessList': 'transcode/business/findAll', //业务
	'movietype': 'system/movietype/findAll', //媒体格式
	'picturetype': 'system/picturetype/findAll', //图片格式类型
	'interfaceVersions': 'base/interfaceVersions', //接口版本号
	'orgTree': 'system/organization/orgsubstree/0', //组织
});


const id: number = ~~opg.request['id'];

const form: JQuery = $('#tbInfo');

$.when(
	opg.api.businessList((data)=> {
		opg('#tdBusiness').checkBox({
			name: 'busiCodes[]',
			data: data
		});
	}),
	opg.api.movietype((data)=> {
		opg('#tdMediaType').checkBox({
			name: 'mediaFormat[]',
			text: 'name',
			value: 'movieType',
			data: data
		});
	}),
	opg.api.picturetype((data)=> {
		opg('#tdPictureType').checkBox({
			name: 'pictureFormat[]',
			text: 'picSize',
			data: data
		});
	}),
	opg.api.interfaceVersions((data)=> {
		let arr = [];
		for (let key in data) {
			arr.push({
				id: key,
				name: data[key]
			});
		}
		data.results = arr;
		opg('#tdInterfaceVersions').radioBox({
			name: 'interfaceVersion',
			data: data,
		});
	}),
	opg.api.orgTree((data)=> {
		data.results = data.root.children;

		opg('<div id="tree2"></div>').tree({
			data: data,
			text: 'name',
			value: 'id',
			combo: {
				allowBlank: true,
				closeOnClick: true,
				textField: '#orgName',
				valueField: '#orgId',
			}
		});
	})
).done(()=> {
	if (id) {
		opg.api.findById({id: id}, function (data) {
			form.jsonToFields(data);
		});
	}
});


window['doSave'] = function (popWin, table) {

	let action,
		param = form.fieldsToJson({
			code: {
				name: '渠道编码',
				type: 'ns',
				require: true
			},
			name: {
				name: '渠道名称',
				type: 'ns',
				require: true
			},
			orgName: {
				name: '所属组织',
				require: true
			},
			orgId: {
				name: '组织Id',
				type : 'number' ,
				require: true
			},
			interfaceVersion: {
				name: '接口版本',
				require: true
			},
			mediaFormat: {
				name: '节目媒体文件',
				type : 'number[]',
				require: true
			},
			pictureFormat: {
				name: '支持图片类型',
				type : 'number[]',
				require: true
			},
			serviceUrl: {
				name: '渠道内容接口',
				require: true
			},
			busiCodes : {
				type : 'number[]',
			},
			connectMode:{
				type : 'number',
			}
		});

	if (!param)
		return true;

	console.log(param);

	delete param.orgName;

	//return true;

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
