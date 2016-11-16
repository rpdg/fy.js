import ops from 'ts/ops.ts';

ops.api({
	'findById!!': 'system/station/findById/${id}',
	'update!post': 'system/station/update',
	'add!post': 'system/station/add',

	'businessList': 'transcode/business/findAll', //业务
	'movietype': 'system/movietype/findAll', //媒体格式
	'picturetype': 'system/picturetype/findAll', //图片格式类型
	'interfaceVersions': 'base/interfaceVersions', //接口版本号
	'orgTree': 'system/organization/orgsubstree/0', //组织
});


const id: number = ~~ops.request['id'];

const form: JQuery = $('#tbInfo');

$.when(
	ops.api.businessList((data)=> {
		ops('#tdBusiness').checkBox({
			name: 'busiCodes[]',
			data: data
		});
	}),
	ops.api.movietype((data)=> {
		ops('#tdMediaType').checkBox({
			name: 'mediaFormat[]',
			text: 'name',
			value: 'movieType',
			data: data
		});
	}),
	ops.api.picturetype((data)=> {
		ops('#tdPictureType').checkBox({
			name: 'pictureFormat[]',
			text: 'picSize',
			data: data
		});
	}),
	ops.api.interfaceVersions((data)=> {
		let arr = [];
		for (let key in data) {
			arr.push({
				id: key,
				name: data[key]
			});
		}
		data.results = arr;
		ops('#tdInterfaceVersions').radioBox({
			name: 'interfaceVersion',
			data: data,
		});
	}),
	ops.api.orgTree((data)=> {
		data.results = data.root.children;

		ops('<div id="tree2"></div>').tree({
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
		ops.api.findById({id: id}, function (data) {
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

	return ops.api[action](param, function () {
		popWin.close();
		table.update();
	});

};
