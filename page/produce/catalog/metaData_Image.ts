import ops from 'ts/ops.ts';

$('#tbImages').on('click' , '.btn-info' , function () {
	let size = $(this).data('size');

	top.ops(`<iframe src="/page/produce/catalog/metaDataGenImage.html"></iframe>`).popup({
		title: `制作 ${size} 图片`,
		btnMax : true ,
		width: 680,
		height: 480,
		buttons :{
			ok : '上传',
			cancel : '返回',
		},
		callback:function () {

		},
	})
});
