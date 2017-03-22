import opg from 'ts/opg';
import Popup from "ts/ui/Popup";
import Table from "ts/ui/Table";

opg.api({
	template: 'admin/template/findAll',
	findVideoMeta: 'admin/collect/findVideoMeta',
	'submitCollect!POST!': 'admin/collect/submitCollect',
});


const taskId = opg.request['taskId'];
let streams :Array;

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
$('#btnUpFilePath').click(function () {
	let mediaPath= iptVideoFile.val();
	if (mediaPath) {
		opg.api.findVideoMeta({mediaPath}, (data) => {
			streams = data.streams;



			//todo:remove before deplore
			let mediaData = {
				"ResultCode": 0,
				"ResultMsg": "OK",
				"MediaInfo": {
					"URL": "/home/guwei/media/西游记之大闹天宫-粤语版.mkv",
					"streams": [
						{
							"profile": "High",
							"index": 0,
							"sample_aspect_ratio": "1:1",
							"level": "4.1",
							"frame_rate": "23.000(24000/1001)",
							"refs": 8,
							"title": "CMCT@卿醺压制",
							"bits_per_raw_sample": "8",
							"codec_type": "video",
							"width": 1280,
							"codec_long_name": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
							"display_aspect_ratio": "16:9",
							"codec_name": "h264",
							"height": 720,
							"pix_fmt": "yuv420p"
						},
						{
							"index": 1,
							"sample_fmt": "fltp",
							"title": "国语音轨",
							"codec_type": "audio",
							"channels": 6,
							"bit_rate": "640000",
							"codec_long_name": "ATSC A/52A (AC-3)",
							"codec_name": "ac3",
							"sample_rate": "48000"
						},
						{
							"index": 2,
							"sample_fmt": "fltp",
							"title": "粤语音轨",
							"codec_type": "audio",
							"channels": 6,
							"bit_rate": "448000",
							"codec_long_name": "ATSC A/52A (AC-3)",
							"codec_name": "ac3",
							"sample_rate": "48000"
						},
						{
							"index": 3,
							"title": "国配简体",
							"codec_type": "subtitle",
							"codec_long_name": "ASS (Advanced SubStation Alpha) subtitle",
							"codec_name": "ass",
							"duration": "7156.416000"
						},
						{
							"index": 4,
							"title": "国配繁体",
							"codec_type": "subtitle",
							"codec_long_name": "ASS (Advanced SubStation Alpha) subtitle",
							"codec_name": "ass",
							"duration": "7156.416000"
						},
						{
							"index": 5,
							"title": "粤配简体",
							"codec_type": "subtitle",
							"codec_long_name": "ASS (Advanced SubStation Alpha) subtitle",
							"codec_name": "ass",
							"duration": "7156.416000"
						},
						{
							"index": 6,
							"title": "粤配繁体",
							"codec_type": "subtitle",
							"codec_long_name": "ASS (Advanced SubStation Alpha) subtitle",
							"codec_name": "ass",
							"duration": "7156.416000"
						},
						{
							"duration": "7156.416000",
							"index": 7,
							"filename": "华文楷体.TTF",
							"mimetype": "application/x-truetype-font",
							"codec_type": "attachment"
						}
					],
					"format": {
						"creation_time": "2014-04-04 19:40:13",
						"nb_streams": 8,
						"format_long_name": "Matroska / WebM",
						"format_name": "matroska,webm",
						"encoder": "libebml v1.3.0 + libmatroska v1.4.1",
						"bit_rate": "4559615",
						"duration": "7156.416000",
						"size": "4078813332"
					}
				}
			};
			streams = mediaData.MediaInfo.streams;

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
			opg('#videoTrack').listBox({
				data: streamsHash['video'],
				text: 'title',
				value: 'index',
				autoPrependBlank : false ,
			});

			//音频
			opg('#audioTrack').listBox({
				data: streamsHash['audio'],
				text: 'title',
				value: 'index',
				autoPrependBlank : false ,
			});

			//字幕
			opg('#subtitleTrack').listBox({
				data: streamsHash['subtitle'],
				text: 'title',
				value: 'index',
				autoPrependBlank : false ,
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


			
			$('#tbdProfile').show();
		});
	}
	else{
		iptVideoFile.iptError('视频路径不可为空');
	}
});


//采集模板
opg('#template').listBox({
	api: opg.api.template,
	text: 'name',
	value: 'id',
});





window['doSave'] = function (pop:Popup , tb :Table) {

	let param = $('#tbProfile').fieldsToJson({

		mediaPath :{
			name : '视频文件路径',
			require :true ,
		} ,
		entryTime:{
			name :'入点时间' ,
			type : 'time' ,
			require :true ,
		} ,
		outTime:{
			name :'出点时间' ,
			type : 'time' ,
			require :true ,
		} ,
		template :{
			name : '模板',
			require :true ,
		},
		suggestion : {
			name :'采集意见' ,
			type: 'string' ,
			maxLength : 500 ,
		}
	});

	if(param){
		param.taskId = taskId;
		if(param.audioTrack2){
			param.audioTrack = param.audioTrack2 ;
		}
		if(param.subtitleTrack2){
			param.subtitleTrack = param.subtitleTrack2 ;
		}
		delete param.audioTrack2;
		delete param.subtitleTrack2;
	}

	console.log(param);

	if(param){

		opg.api.submitCollect(param , (data)=>{
			pop.close();
			tb.update();
		});
	}

	return true ;
};
