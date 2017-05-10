import opg from 'ts/opg';
import Popup from "ts/ui/Popup";
import Table from "ts/ui/Table";

opg.api({
	template: 'admin/template/findAll',
	findVideoMeta: 'admin/collect/findVideoMeta',
	'submitCollect!POST': 'admin/collect/submitCollect',
});


const orderId = parseInt(opg.request['orderId']);
let streams: Array;
let duration;

let useIE = $.detectIE();
if (useIE && useIE < 12) {
	$('.fileChooserWrap').on('change', 'input[type="file"]', function () {
		console.log(this, this.files[0]);
		let txt = (this.mozFullPath || this.value).toString();
		$('#' + $(this).data('field')).val(txt);
	});
}
else {
	let fcs = $('.fileChooser');
	fcs.find('.fileChooserB').remove();
	fcs.find('input[type="text"]').attr('placeholder', '请粘贴文件路径，使用IE 10/11可直接选择文件');
}

let iptVideoFile = $('#iptVideoFile');
let cachedMediaPath: string;


$('#btnUpFilePath').click(function () {
	let mediaPath = iptVideoFile.val();//.replace(/\\/g , '/');
	if (mediaPath) {
		opg.api.findVideoMeta({mediaPath}, (data) => {
			cachedMediaPath = mediaPath;
			streams = data.streams;

			//
			let streamsHash = {}, streamHtml: string = '';
			streams.map((stream, i) => {
				let type = stream['codec_type'];
				let entry = streamsHash[type];
				if (!entry) {
					streamsHash[type] = [stream];
				}
				else {
					entry.push(stream);
				}

				streamHtml += `<table class="search-table" style="margin-bottom: 2em; "><tbody>`;
				for (let key in stream) {
					streamHtml += `<tr><td class="lead">${key}</td><td>${stream[key]}</td></tr>`
				}
				streamHtml += `</tbody></table>`;
			});

			//视频
			let videoArr = streamsHash['video']||[];
			videoArr.forEach((item) => {
				item.title = item.title ? item.title : (item.language ? item.language : item.index);
			});
			opg('#videoTrack').listBox({
				data: videoArr,
				text: 'title',
				value: 'index',
				autoPrependBlank: false,
			});

			//音频
			let audioArr = streamsHash['audio']||[];
			audioArr.forEach((item) => {
				item.title = item.title ? item.title : (item.language ? item.language : item.index);
			});
			opg('#audioTrack').listBox({
				data: audioArr,
				text: 'title',
				value: 'index',
				autoPrependBlank: false,
			});

			//字幕
			let subtitleArr = streamsHash['subtitle']||[];
			subtitleArr.forEach((item) => {
				item.title = item.title ? item.title : (item.language ? item.language : item.index);
			});
			opg('#subtitleTrack').listBox({
				data: subtitleArr,
				text: 'title',
				value: 'index',
				autoPrependBlank: false,
			});

			//详情
			let tdDetails = $('#tdDetails');
			let aExpand = $('#aExpand').click(function () {
				let a = $(this);
				if (a.hasClass('expanded')) {
					$(this).removeClass('expanded').text('(展开)');
					tdDetails.html('<span class="text-light-gray">详情已折叠，点击展开 ...</span>');
				}
				else {
					$(this).addClass('expanded').text('(收起)');
					tdDetails.html(streamHtml);
				}
			});
			tdDetails.on('click', '.text-light-gray', function () {
				aExpand.trigger('click');
			});

			//duration
			if(data.format && data.format.duration)
				duration = data.format.duration ;


			$('#tbdProfile').show();
		});
	}
	else {
		iptVideoFile.iptError('视频路径不可为空');
	}
});


//采集模板
opg('#template').listBox({
	api: opg.api.template,
	text: 'name',
	value: 'id',
});


window['doSave'] = function (pop: Popup, tb: Table) {
	iptVideoFile.val(cachedMediaPath);

	let param = $('#tbProfile').fieldsToJson({

		mediaPath: {
			name: '视频文件路径',
			require: true,
		},
		entryTime: {
			name: '入点时间',
			type: 'time',
			//require: true,
		},
		outTime: {
			name: '出点时间',
			type: 'time',
			//require: true,
		},
		templateId: {
			name: '模板',
			require: true,
			type: 'int',
		},
		suggestion: {
			name: '采集意见',
			type: 'string',
			maxLength: 500,
		}
	});

	if (param) {
		//param.taskId = taskId;
		param.orderId = orderId;
		/*if (param.audioTrack2) {
			param.audioTrack = param.audioTrack2;
		}
		if (param.subtitleTrack2) {
			param.subtitleTrack = param.subtitleTrack2;
		}
		delete param.audioTrack2;
		delete param.subtitleTrack2;*/


		param.secondAudit = (param.secondAudit == '1');
		param.thirdAudit = (param.thirdAudit == '1');
		param.catalog = (param.catalog == '1');
		//param.templateId = +param.templateId ;
	}

	console.log(param);

	if (param) {

		param.duration = duration;

		opg.api.submitCollect(param, (data) => {
			pop.close();
			tb.update();
		});
	}

	return true;
};
