import opg from 'ts/opg.ts';

import {Cache} from 'ts/util/store' ;


opg.api({
	'saveAssetPic!!': 'produce/catalogPic/saveAssetPic/${assetIds}',
});


let cache = Cache.getInstance();
let data = cache.get('imgUpload');

if (data.message) {
	$('#h3').text(data.message);
}

let picArr = [], picIndexArr = [], picSrcArr = [];
let rds = Math.random() ;
for (let ik in data.picUrl) {

	picArr.push({
		id: ik,
		url: data.picUrl[ik],
	});
	picIndexArr.push(ik);
	picSrcArr.push(data.picUrl[ik] + '?' + rds);
}


console.log(data, picArr);
let thead = `<thead><tr><th>${picIndexArr.join('</th><th>')}</th></tr></thead>`;
let tbody = `<tbody><tr><td class="text-center"><img src="${picSrcArr.join('"></td><td class="text-center"><img src="')}"></td></tr></tbody>`;

$('#tbImages').html(thead + tbody);


//(document.getElementById('view') as HTMLImageElement).src = opg.request['src'] ;

window['doSave'] = function (assetId, previewPopWin) {

	let assetIds = assetId ;
	let batchData = cache.get('checkedBatchCategory');
	if(batchData){
		let arr = [];
		batchData.map((val, i) => {
			console.log(i, val);
			arr.push(val['assetId']);
		});
		assetIds = arr.join(',');
	}

	opg.api.saveAssetPic({assetIds: assetIds}, function (data) {
		let win = cache.get('srcWindow')  ;
		cache.remove('srcWindow');
		win.loadImages(data.picUrl , data.message);

		

		previewPopWin.close();
	});
};