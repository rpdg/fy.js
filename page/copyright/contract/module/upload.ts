import opg from 'ts/opg.ts';

import Table from 'ts/ui/Table';
import Popup from 'ts/ui/Popup';


let file: File;

let fileChooser :HTMLInputElement = document.getElementById('file') as HTMLInputElement;
$(fileChooser).on('change', (event) => {
	//debugger;
	let files = event.target.files;
	if (files && files.length) {
		file = files[0];
		console.log(file.type);
	}
});

if ('draggable' in document.createElement('span')) {
	let elem = $('#wrapForm');
	elem[0].ondragover = function () {
		elem.addClass('dragHover');
		return false;
	};
	elem[0].ondragleave = function () {
		elem.removeClass('dragHover');
		return false;
	};
	elem[0].ondrop = function (e) {
		elem.removeClass('dragHover');
		e.preventDefault();
		file = e.dataTransfer.files[0];
		//	I like this solution. It doesn't work in IE 11 or Firefox though (input.files is a read-only property)
		// noinspection JSAnnotator
		fileChooser.files = e.dataTransfer.files ;

		console.log(file.type);
	};
}



opg.api({
	'upload!UPLOAD': 'copyright/contract/uploadCopyrightContract',
});

window['doUpload'] = function (pop: Popup, tb: Table) {
	if (file) {
		let formData = new FormData(document.getElementById('wrapForm') as HTMLFormElement);

		opg.api.upload(formData, function (data) {
			console.log(data, pop);
			opg.ok('导入成功' , ()=>{
				tb.update();
				pop.close();
			});
		});
	}
	else {
		opg.warn('请选择文件');
	}
};