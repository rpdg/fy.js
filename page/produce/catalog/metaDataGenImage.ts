import opg from 'ts/opg.ts';
import PopUp from "ts/ui/Popup";
import {Cache} from 'ts/util/store' ;


opg.api({
	'scalePic!post': 'produce/catalogPic/scalePic',
	'uploadPic!upload': 'produce/catalogPic/uploadPic',
});

const assetId: string = opg.request['assetId'];
let size: string = opg.request['size'];
let sizeStrArr: string[] = size.split('x');

class Uploader {
	private _file: File;

	private _fileChooser: HTMLInputElement;
	private _fileDropper: HTMLElement;

	imgSrc: string;

	constructor() {
		this._fileChooser = document.getElementById('iptFileUpload') as HTMLInputElement;

		this.initEventListeners();

		if ('draggable' in document.createElement('span')) {
			this._fileDropper = document.getElementById('imgContainer');
			this.initDnd();
		}
	}

	initDnd() {
		let self = this, elem = self._fileDropper;

		elem.ondragover = function () {
			$(this).addClass('dragHover');
			return false;
		};
		elem.ondragend = function () {
			return false;
		};
		elem.ondrop = function (e) {
			$(this).removeClass('dragHover');
			e.preventDefault();
			self.file = e.dataTransfer.files[0];
			//	I like this solution. It doesn't work in IE 11 or Firefox though (input.files is a read-only property)
			// noinspection JSAnnotator
			self._fileChooser.files = e.dataTransfer.files;
		};
	}

	initEventListeners() {
		let self = this;
		$(this._fileChooser).on('change', (event) => {
			let files = event.target.files;
			if (files && files.length) {
				self.file = files[0];
			}
		});
		/*opg.listen('imageChecked' , function (evt:JQueryEventObject , file :File) {
		 console.log(file);
		 self.upload(file);
		 });*/
	}

	get file(): File {
		return this._file;
	}

	set file(file: File) {
		if (this.checkImage(file)) {
			this._file = file;
		}
	}

	checkImage(imgFile: File): boolean {

		if (!imgFile.type.match(/image.*/)) {
			return false;
		}
		/*if(file.size > 1024 * 2) {
		 alert('图片大小不能超过 2KB!');
		 return false;
		 }*/
		opg.dispatch('imageChecked', imgFile);
		this.imgSrc = null;
		this.upload(imgFile);
		return true;
	}

	upload(imgFile: File) {
		let self = this;
		let formData = new FormData();
		formData.append('file', imgFile);
		formData.append('assetId', assetId);
		formData.append('picSize', size);

		opg.api.uploadPic(formData, (data) => {
			opg.dispatch('uploadSuccess');
			self.imgSrc = data['picUrl'][size];
		});

	}

}

class Editor {
	hasText: boolean = false;

	private viewPort: JQuery;
	private infoLog: JQuery;
	private cropRect: JQuery;
	private zoomer: ZoomBar;

	private img: HTMLImageElement;
	private crop: CropInfo;

	constructor(width: number, height: number) {
		let self = this;
		this.viewPort = $('#imgContainer');
		/*this.viewPort.css({
		 width: width,
		 height: height,
		 });*/
		this.infoLog = $('#infoLog');
		this.cropRect = $('#cropView');
		this.crop = {
			imgWidth: 0,
			imgHeight: 0,
			x: 0,
			y: 0,
			width: width,
			height: height,
		};
		if (width === 420 && height === 336) {
			this.createInput();
		}

		//noinspection TypeScriptUnresolvedFunction
		this.cropRect.css({width: width, height: height}).draggable({
			containment: "parent"
		});

		this.zoomer = new ZoomBar();

		opg.listen('imageChecked', function (evt: JQueryEventObject, file: File) {
			//console.log(file);
			self.previewImg(file);
		});
	}

	setSize(width: number, height: number) {
		this.crop.x = 0;
		this.crop.y = 0;
		this.crop.width = width;
		this.crop.height = height;

		//noinspection TypeScriptUnresolvedFunction
		this.cropRect.css({width: width, height: height, left: 0, top: 0});

		this.image = this.img;
	}

	createInput() {
		//noinspection TypeScriptUnresolvedFunction
		$('#divInput').show().draggable();
		this.hasText = true;
	}

	previewImg(file: File) {
		let self = this;
		let fileSize = opg.format.fileSize(file.size);

		let reader = new FileReader();

		reader.onload = function (e) {
			let img = document.createElement('img');
			img.className = 'base64Img';
			//noinspection TypeScriptUnresolvedVariable
			img.src = e.target.result;
			self.viewPort.show().empty().append(img);
			console.log({w: img.width, h: img.height}, $(img).height());

			setTimeout(function () {
				self.infoLog.html(`图像原始大小：<br>
								宽：${img.width}<br>
								高：${img.height}<br>
								${fileSize}
						`);
			}, 100);


			self.zoomer.reset();
			self.zoomer.image = img;
			self.image = img;
		};

		reader.readAsDataURL(file);
	}

	set image(image: HTMLImageElement) {
		this.img = image;
		this.crop.imgWidth = image.width;
		this.crop.imgHeight = image.height;

		//let self = this;

		//noinspection TypeScriptUnresolvedFunction
		$(image).css({top: 0, left: 0}).draggable();
		/*$(image).on('mousedown', () => {
		 self.viewPort.on('mousemove' , ()=>{

		 });
		 });*/
	}

	get cropInfo(): CropInfo {
		let posImg = $(this.img).position();
		let posCrop = this.cropRect.position();

		if ((posCrop.left < posImg.left) ||
			(posCrop.top < posImg.top) ||
			(posCrop.left + this.crop.width > posImg.left + this.img.width) ||
			(posCrop.top + this.crop.height > posImg.top + this.img.height)
		) {
			opg.alert('截取错误');
			return null;
		}

		this.crop.x = posCrop.left - posImg.left;
		this.crop.y = posCrop.top - posImg.top;
		this.crop.imgWidth = this.img.width;
		this.crop.imgHeight = this.img.height;

		return this.crop;
	}
}

interface CropInfo {
	x: number ;
	y: number ;
	width: number ;
	height: number ;
	imgWidth: number ;
	imgHeight: number ;
}

class ZoomBar {
	private _yInit: number = 92;
	private _yMin = 52;
	private _yMax = 133;

	private _ratio: number = 1;
	private _minRatio: number = 0.1;

	private _img: HTMLImageElement;
	private _imgH = 0;
	private _imgW = 0;

	private _slider: JQuery;

	constructor() {
		let slider = this._slider = $('#zoomSlider');
		let bar = $('#zoomBar');

		this._yInit = slider.position().top;

		let yMin = this._yMin;
		let yMax = this._yMax;
		let sliderHeight = this._yInit - yMin;
		let self = this;

		document.onselectstart = function () {
			return false;
		};


		slider.on('mousedown', function (evt) {


			let py0 = evt.pageY, y0 = slider.position().top;
			let pad = py0 - y0;

			bar.on('mousemove', function (e) {
				//
				let y = e.pageY - pad;
				if (y < yMin) y = yMin;
				else if (y > yMax) y = yMax;

				slider.css('top', y);

				self._ratio = Math.max((y - yMin) / sliderHeight, self._minRatio);
				console.warn(y, yMin, sliderHeight, self._ratio);
				if (self._img) {
					self.zoomImg();
				}
			});

			$(document).on('mouseup', () => {
				bar.off('mousemove');
			});
		});

		bar.on('mouseup mouseleave', function () {
			bar.off('mousemove');
			//document.onselectstart = null;
		});
	}

	reset() {
		this._slider.css('top', this._yInit);
		this._ratio = 1;
		this._img = null;
		this._imgW = 0;
		this._imgH = 0;
	}

	set image(imgElem: HTMLImageElement) {
		let self = this;

		this._img = imgElem;

		setTimeout(() => {
			self._imgW = imgElem.width;
			self._imgH = imgElem.height;
		}, 100);
	}

	zoomImg() {
		console.log(this._ratio, this._imgW, this._imgH);
		this._img.width = this._imgW * this._ratio;
		this._img.height = this._imgH * this._ratio;
	}
}

let uploader = new Uploader();
let editor = new Editor(parseFloat(sizeStrArr[0]), parseFloat(sizeStrArr[1]));
$('#h2Size').text('制作 '+size + '图片');

window['doUpload'] = function (pop) {
	if (uploader.imgSrc) {
		let cropInfo = editor.cropInfo;

		let param = {
			cropx: cropInfo.x,
			cropy: cropInfo.y,
			cropWidth: cropInfo.width,
			cropHeight: cropInfo.height,
			imageWidth: cropInfo.imgWidth,
			imageHeight: cropInfo.imgHeight,
			assetId: assetId,
			picPath: uploader.imgSrc,
			picSize: size,
		};
		if (editor.hasText) {
			param['pressTxt1'] = $('#row1').val();
			param['pressTxt2'] = $('#row2').val();
		}

		console.log(param);
		opg.api.scalePic(param, (data) => {

			if (size == '300x444') {
				$('#iptFileUpload').css('visibility', 'hidden');
				size = '300x408';
				sizeStrArr = size.split('x');
				editor.setSize(parseFloat(sizeStrArr[0]), parseFloat(sizeStrArr[1]));
				$('#h2Size').text('制作 '+size + '图片');
				opg.ok('300x444图制作成功，现在继续制作300x408图');
			}
			else {
				showNextPreviewWindow(data, pop);
			}

		});
	}
};


function showNextPreviewWindow(data: any, pop: PopUp) {
	let cache = Cache.getInstance();
	cache.set('imgUpload', data);


	let container = `<iframe src="/page/produce/catalog/viewImage.html"></iframe>`;

	let previewWin = top.opg.confirm(container, function (i, iframe) {
		iframe.doSave(assetId, previewWin);
		return true;
	}, {
		title: `图片预览`,
		btnMax: true,
		width: 600,
		height: 420,
		buttons: {
			ok: `保存图片`,
			cancel: '取消',
		},
		onDestroy: function () {
			console.warn("cache.remove('imgUpload');");
			cache.remove('imgUpload');
		}
	}).toggle();

	pop.close();
}
