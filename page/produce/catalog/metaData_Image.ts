import opg from 'ts/opg.ts';

import {Cache} from 'ts/util/store' ;


let cache = Cache.getInstance();


let assetId = opg.request['assetId'] ;

$('#tbImages').on('click' , '.btn-info' , function () {
	//制作
	cache.set('srcWindow' ,window);

	let size = $(this).data('size');

	//cache.set('curImage' , document.getElementById(`img_${size}`));
	//console.warn(cache.get('curImage') , `img_${size}` ) ;

	let pop = top.opg(`<iframe src="/page/produce/catalog/metaDataGenImage.html?assetId=${assetId}&size=${size}"></iframe>`).popup({
		title: `制作图片`,
		btnMax : true ,
		width: 680,
		height: 480,
		buttons :{
			ok : '上传',
			cancel : '返回',
		},
		callback:function (i, ifr) {
			//console.log(i, ifr);
			if(i==0){
				ifr.doUpload(pop);
				return true;
			}
			return false;
		},
	}).toggle();

}).on('click' , '.btn-success' , function () {
	//上传单图
	cache.set('srcWindow' ,window);

	let size = $(this).data('size');

	//cache.set('curImage' , document.getElementById(`img_${size}`));
	//console.warn(cache.get('curImage') , `img_${size}` ) ;

	let pop = top.opg.confirm(`<iframe src="/page/produce/catalog/uploadImage.html?assetId=${assetId}&size=${size}"></iframe>` , function (i, ifr) {
			//console.log(i, ifr);
			ifr.doUpload(pop);
			return true;
		} , {
			title: `上传 ${size} 图片`,
			width: 480,
			height: 240,
			buttons: {
				ok: `上传 ${size} 图片`,
				cancel: '返回',
			},
		});
});


//上传图片包
$('#btnBatchAdd').click(()=>{
	cache.set('srcWindow' ,window);

	let pop = top.opg.confirm(`<iframe src="/page/produce/catalog/uploadZip.html?assetId=${assetId}"></iframe>` , function (i, ifr) {
		//console.log(i, ifr);
		ifr.doUpload(pop);
		return true;
	} , {
		title: `上传图片包`,
		width: 480,
		height: 300,
		buttons: {
			ok: `上传图片包`,
			cancel: '返回',
		},
	});
});