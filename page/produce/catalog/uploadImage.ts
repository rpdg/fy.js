import opg from 'ts/opg.ts';
import {Cache} from 'ts/util/store' ;

class ImageChooser{

	private _imgInfo : ImageInfo ;
	private _fileChooser : HTMLInputElement ;

	private _file: File;


	constructor(width:number , height : number){
		this._imgInfo = new ImageInfo(width , height) ;
		this._fileChooser = document.getElementById('iptFileUpload') as HTMLInputElement;

		this.initEvents();
	}

	initEvents(){
		$(this._fileChooser).on('change', (event) => {
			//debugger;
			let files = event.target.files;
			if (files && files.length) {
				this.file = files[0];
			}
		});
	}


	checkImage(imgFile: File): boolean {

		if (!imgFile.type.match(/image.*/)) {
			return false;
		}
		/*if(file.size > 1024 * 2) {
		 alert('图片大小不能超过 2KB!');
		 return false;
		 }*/

		return true;
	}


	get file(): File {
		return this._file;
	}

	set file(file: File) {
		if (this.checkImage(file)) {
			this._file = file;
			this._imgInfo.image = file;
		}
	}
}

class ImageInfo{
	private _validWidth : number ;
	private _validHeight : number ;
	private _image: File;

	private _output :JQuery;
	private _thumbnail :JQuery;

	constructor(width:number , height : number){
		this._output = $('#info');
		this._thumbnail = $('#thumbImg');

		this._validWidth = width ;
		this._validHeight = height ;
	}

	set image(imgFile: File){
		let self = this;
		let fileSize = opg.format.fileSize(imgFile.size);

		let reader = new FileReader();

		reader.onload = function (e) {

			let img = document.createElement('img');
			//noinspection TypeScriptUnresolvedVariable
			img.src = e.target.result;

			//out.put
			setTimeout( () => {

				let liClass = '' , miscTxt = '';
				if(img.width != self._validWidth || img.height != self._validHeight ){
					liClass = 'text-red' ;
					miscTxt = `，期望为：${self._validWidth} x ${self._validHeight}`;
				}

				self._output.html(`
					<li>文件大小：${fileSize}</li>
					<li class="${liClass}">图像尺寸：${img.width} x ${img.height} ${miscTxt}</li>
				`);
			} , 100) ;


			self._thumbnail.attr('src' , img.src);
		};

		reader.readAsDataURL(imgFile);

		this._image = imgFile ;
	}
	get image(): File {
		return this._image;
	}
}


let assetId :string = opg.request['assetId'] ;
let sizeStr :string[] = opg.request['size'].split('x');
let oWidth = parseFloat(sizeStr[0]) , oHeight = parseFloat(sizeStr[1]) ;
let chooser = new ImageChooser(oWidth , oHeight);



opg.api({
	'uploadPic!UPLOAD' :'produce/catalogPic/uploadPic',
});

window['doUpload'] = (pop)=>{
	if(chooser.file){
		let formData = new FormData();
		formData.append('file', chooser.file);
		formData.append('assetId', assetId);
		formData.append('picSize', opg.request['size']);

		opg.api.uploadPic(formData , (data)=>{

			let cache = Cache.getInstance();
			cache.set('imgUpload' , data);

			let container = `<iframe src="/page/produce/catalog/viewImage.html"></iframe>`;

			let previewWin = top.opg.confirm(container , function (i , iframe) {
				iframe.doSave(assetId , previewWin) ;
				return true ;
			} , {
				title: `图片预览`,
				btnMax : true ,
				width: 600,
				height: 420,
				buttons: {
					ok: `保存图片`,
					cancel: '取消',
				},
				onDestroy : function () {
					console.warn("cache.remove('imgUpload');");
					cache.remove('imgUpload');
				}
			}).toggle();

			pop.close();
		});
	}
	else {
		opg.warn('请选择图像文件');
	}
};