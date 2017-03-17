import opg from 'ts/opg.ts';

let id = opg.request['id'];
const formTb = $('#tbProfile');

opg.api({
	'findById!!': 'admin/template/findById?id=${id}',
	'save!post': 'admin/template/addOrUpdate' ,
	configs: 'admin/template/findConfigs' ,
});



opg.api.configs((data)=>{

	function parseCfg(type:'video'|'audio'){
		let cfg = opg.convert.arrayToHash(data[`${type}Configs`] , 'key');

		$(`#tbd_${type}`).find('select').each((i , sel:HTMLSelectElement)=>{

			if(cfg[sel.name]){
				let values = [] ;
				cfg[sel.name].values.map((val , i)=>{
					values[i] = {name : val} ;
				}) ;

				opg(sel).listBox({
					autoPrependBlank : false,
					data : values ,
					value : 'name' ,
					text : 'name' ,
				})
			}
		}) ;
	}

	parseCfg('video');
	parseCfg('audio');


	if(id){
		opg.api.findById({id} , (data)=>{
			formTb.jsonToFields(data);
		})
	}
});



//Save
window['doSave'] = function (popWin, table) {
	let param = formTb.fieldsToJson({
		name : {
			name: '名称',
			type : 'ns',
			require: true ,
		} ,
		videoAvgCodeRate : {
			name: '视频平均码率',
			type : 'ns',
			require: true ,
		} ,
		videoMaxCodeRate : {
			name: '视频最高码率',
			type : 'ns',
			require: true ,
		} ,
		videoGopSize : {
			name: '视频GOP大小',
			type : 'ns',
			require: true ,
		} ,
		videoBCount : {
			name: '视频B帧数量',
			type : 'ns',
			require: true ,
		} ,
		videoReferFrame : {
			name: '视频参考帧',
			type : 'ns',
			require: true ,
		} ,
		audioCodeRate : {
			name: '音频码率',
			type : 'ns',
			require: true ,
		} ,
		/*outputPath : {
			name: '输出路径',
			type : 'string',
			require: true ,
		} ,*/
	});

	if(param){
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