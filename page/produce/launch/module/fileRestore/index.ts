import opg from 'ts/opg.ts';
import Table from 'ts/ui/Table' ;


opg.api({
	business: 'transcode/business/findAll', //业务
});

let tb0 :Table = opg('#tb0').table({
	columns : [
		{
			src : 'name' ,
			text : '内容名称' ,
		} ,
		{
			src : 'name' ,
			text : '内容类型' ,
			width: 100 ,
		} ,
		{
			src : 'name' ,
			text : '已生产业务' ,
		} ,
		{
			src : 'name' ,
			text : '生产中业务' ,
		} ,
		{
			src : 'name' ,
			text : '创建时间' , width: 90,
		} ,
		{
			src : 'name' ,
			text : '时长' , width: 90,
		} ,
		{
			src : 'name' ,
			text : '创建人' , width: 90,
		} ,
		{
			src : 'name' ,
			text : '操作' , width: 50,
		} ,
	]
}) ;

let tb1 :Table = opg('#tb1').table({
	api : opg.api.business ,
	columns : [
		{
			src : 'name' ,
			text : '生产库' ,
		} ,
		{
			src : 'name' ,
			text : '生产状态' ,
			width: 100 ,
		} ,
		{
			src : 'name' ,
			text : '备份' , width: 90,
		} ,
		{
			src : 'name' ,
			text : '云上备份' , width: 90,
		} ,
		{
			src : 'name' ,
			text : 'CMS库' , width: 90,
		} ,
		{
			src : 'name' ,
			text : '编码格式' , width: 100,
		} ,
		{
			src : 'name' ,
			text : '视频尺寸' , width: 80,
		} ,
		{
			src : 'name' ,
			text : '音频格式' , width: 100,
		} ,
		{
			src : 'name' ,
			text : ' ' ,
			cmd : 'checkAll'
		} ,
	]
}) ;



window['doSave'] = function (btnIndex :number) {
	let val = tb1.getCheckedValue();
	if(val.length){
		let param = {
			value: val ,
		};
		console.log(param);

		if(btnIndex===0){
			//todo:磁带回迁
			alert('磁带回迁')
		}
		else{
			//todo:回迁
			alert('回迁')
		}
	}
	else{
		opg.warn('请选择文件');
	}

};

