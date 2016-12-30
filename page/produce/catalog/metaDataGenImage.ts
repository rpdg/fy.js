import ops from 'ts/ops.ts';

class Uploader {
	private _file: File;

	private _fileChooser: HTMLInputElement;
	private _fileDropper: HTMLElement;
	private _uploadUrl: string;

	constructor(uploadUrl: string) {
		this._uploadUrl = uploadUrl;
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
			$(this).addClass('drag-hover');
			return false;
		};
		elem.ondragend = function () {
			return false;
		};
		elem.ondrop = function (e) {
			$(this).removeClass('drag-hover');
			e.preventDefault();
			self.file = e.dataTransfer.files[0];
			self._fileChooser.files[0] = self.file;
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
		/*ops.listen('imageChecked' , function (evt:JQueryEventObject , file :File) {
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
		ops.dispatch('imageChecked', imgFile);
		return true;
	}

	upload(file: File) {
		if (FormData) {
			let self = this;

			let formData = new FormData();
			formData.append('file', file);

			let xhr = new XMLHttpRequest();
			xhr.open('POST', this._uploadUrl, true);
			xhr.onload = () => {
				self.uploadSuccess(xhr.responseText);
				ops.dispatch('uploadSuccess');
			};

			xhr.send(formData);
		}
		else {
			alert('不支持 XMLHttp 上传');
		}
	}

	uploadSuccess(src) {
		//this.viewPort.find('.base64Img').removeClass('base64Img').attr('src', src);
	}

}

class Editor {
	private viewPort: JQuery;
	private infoLog: JQuery;
	private zoomer: ZoomBar;

	private x: number = 0;
	private y: number = 0;
	private w: number = 0;
	private h: number = 0;

	constructor() {
		let self = this;
		this.viewPort = $('#imgContainer');
		this.infoLog = $('#infoLog');

		this.zoomer = new ZoomBar();

		ops.listen('imageChecked', function (evt: JQueryEventObject, file: File) {
			//console.log(file);
			self.previewImg(file);
		});
	}

	previewImg(file: File) {
		let self = this;
		let fileSize  = ops.format.fileSize(file.size);

		let reader = new FileReader();

		reader.onload = function (e) {
			let img = document.createElement('img');
			img.className = 'base64Img';
			//noinspection TypeScriptUnresolvedVariable
			img.src = e.target.result;
			self.viewPort.show().empty().append(img);
			//console.log({w: img.width, h: img.height});

			self.infoLog.html(`图像原始大小：<br>
								宽：${img.width}<br>
								高：${img.height}<br>
								${fileSize}
							`);

			self.zoomer.reset();
			self.zoomer.image = img;
		};

		reader.readAsDataURL(file);
	}
}

class ZoomBar {
	private _yInit: number = 92;
	private _yMin = 52;
	private _yMax = 133;

	private _ratio: number = 1;
	private _minRatio :number = 0.1 ;

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
				console.log(y, yMin, sliderHeight, self._ratio);
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
		this._img = imgElem;
		this._imgW = imgElem.width;
		this._imgH = imgElem.height;
	}

	zoomImg() {
		console.log(this._ratio);
		this._img.width = this._imgW * this._ratio;
		this._img.height = this._imgH * this._ratio;
	}
}


let uploader = new Uploader('');
let editor = new Editor();

