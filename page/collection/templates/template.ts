import opg from 'ts/opg.ts';

let id = opg.request['id'];
const formTb = $('#tbProfile');

opg.api({
	'findById!!': 'admin/template/findById?id=${id}',
	'save!post': 'admin/template/addOrUpdate',
	configs: 'admin/template/findConfigs',
});


opg.api.configs((data) => {

	function parseCfg(type: 'video' | 'audio' | 'system') {
		let cfg = opg.convert.arrayToHash(data[`${type}Configs`], 'key');

		$(`#tbd_${type}`).find('select').each((i, sel: HTMLSelectElement) => {

			if (cfg[sel.name]) {
				let values = [];
				cfg[sel.name].values.map((val, i) => {
					let v , p = val.indexOf('-') ;
					if (p > -1) {
						let id = val.substr(0, p), name = val.substr(p+1);
						v = {id, name};
					}
					else{
						v = {id:val , name:val};
					}
					values[i] = v;
				});

				opg(sel).listBox({
					autoPrependBlank: false,
					data: values,
					value : "id",
					text : 'name',
				})
			}
		});
	}

	parseCfg('video');
	parseCfg('audio');
	parseCfg('system');


	if (id) {
		opg.api.findById({id}, (data) => {
			formTb.jsonToFields(data);
		})
	}
});


//Save
window['doSave'] = function (popWin, table) {
	let param = formTb.fieldsToJson({
		name: {
			name: '名称',
			type: 'ns',
			require: true,
		},
		videoAvgCodeRate: {
			name: '视频平均码率',
			type: 'ns',
			require: true,
		},
		videoMaxCodeRate: {
			name: '视频最高码率',
			type: 'ns',
			require: true,
		},
		videoGopSize: {
			name: '视频GOP大小',
			type: 'ns',
			require: true,
		},
		videoBCount: {
			name: '视频B帧数量',
			type: 'ns',
			require: true,
		},
		videoReferFrame: {
			name: '视频参考帧',
			type: 'ns',
			require: true,
		},
		audioCodeRate: {
			name: '音频码率',
			type: 'ns',
			require: true,
		},
		/*outputPath : {
			name: '输出路径',
			type : 'string',
			require: true ,
		} ,*/
		outputFormat : {
			name: '目标格式',
			type : 'string',
			require: true ,
		} ,
		systemCodeRate : {
			name: '封装码率',
			type : 'string',
			require: true ,
		} ,
	});

	if (param) {
		console.log(param);

		if (id) {
			param.id = id;
		}

		opg.api.save(param, function () {
			popWin.close();
			table.update();
		});
	}

	return true;

};