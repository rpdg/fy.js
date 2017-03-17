

import opg from 'ts/opg.ts';

import {Cache} from 'ts/util/store' ;


let cache = Cache.getInstance();

let file :File;

$('#file').on('change', (event) => {
	//debugger;
	let files = event.target.files;
	if (files && files.length) {
		file = files[0];
		console.log(file.type);
	}
});

opg.api({
	'uploadZip!UPLOAD' :'produce/catalogPic/uploadPicPackage',
});

let assetId = opg.request['assetId'] ;
let batchData = cache.get('checkedBatchCategory');
if(batchData){
	let arr = [];
	batchData.map((val, i) => {
		console.log(i, val);
		arr.push(val['assetId']);
	});
	assetId = arr.join(',');
}

(document.getElementById('assetIds') as HTMLInputElement).value = assetId ;

window['doUpload'] = function(pop){
	if(file){
		let formData = new FormData(document.getElementById('wrapForm') as HTMLFormElement);

		opg.api.uploadZip(formData , function(data){
			console.log(data , pop);

			let win = cache.get('srcWindow') ;
			cache.remove('srcWindow');
			win.loadImages(data.picUrl , data.message);



			pop.close();
		});
	}
	else {
		opg.warn('请选择zip文件');
	}
};