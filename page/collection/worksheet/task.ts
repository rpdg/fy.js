import opg from 'ts/opg.ts';


opg.api({
	findByTaskId: 'admin/collect/findByTaskId',
});

const taskId = opg.request['id'];

const statusHash = {
	0 : '待采集' ,
	1 : '采集中' ,
	2 : '采集完成' ,
	3 : '采集取消' ,
	4 : '采集失败' ,
};

opg.api.findByTaskId({taskId}, (data) => {
	$('#title').text(opg.request['title']);
	$('#status').text(statusHash[data.status]);
	$('#progress').text(data.progress + '%');
	$('#templateName').text(data.templateName);
	$('#mediaPath').text(data.mediaPath);
	$('#targetFile').text(data.targetFile);
});


