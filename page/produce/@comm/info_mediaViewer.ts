import opg from 'ts/opg.ts';

import AuditPlayer from './AuditPlayer';
import {IComment, AuditTable} from './AuditTable';


opg.api({
	'saveAudit!POST': 'audit/saveAuditComment'
});


interface MediaInfo {
	orderId: number ;
	fileId: number ;
	filePath: string ;
	commentArray: IComment[] ;
	writable: boolean;
}

let mediaInfo: MediaInfo;

const SVG_PATH = __uri('/lib/player/plyr.svg');


opg.listen('MediaInfoLoaded', function (evt, data: MediaInfo) {
	if (!mediaInfo) {
		console.log(data);
		initMediaAudit(data);
	}
});

function initMediaAudit(data: MediaInfo) {
	mediaInfo = data;

	let auditPlayer = new AuditPlayer('my-video', SVG_PATH);
	let auditTable = new AuditTable('tbMarkBody', SVG_PATH);

	//button to add mark
	let btnAddMark = $('#btnAddMark');
	//button to save data
	let btnSaveComment = $('#btnSaveComment');


	auditPlayer.onVideoReady = () => {

		if (data.writable) {

			//enable the add mark button
			btnAddMark.text('添加审核意见').addClass('btn-warning').prop('disabled', false);

			//add a remark
			btnAddMark.on('click', () => {
				auditPlayer.pause();
				let ipt = auditTable.appendRow(auditPlayer.currentTime);
				ipt.focus();
			});

			//remove the remark entry
			auditTable.tb.on('click', '.btn-danger', evt => {
				//auditTable.removeRowByTime(+$(evt.currentTarget).data('time') as number);
				auditTable.removeRowById($(evt.currentTarget).data('tid'));
			});

			//save data
			btnSaveComment.show();
			btnSaveComment.on('click', () => {
				let comments = opg.array.sort(auditTable.data, 'time');
				console.log(comments);
				opg.api.saveAudit({orderId: mediaInfo.orderId, comment: JSON.stringify(comments)}, (json) => {
					mediaInfo.commentArray = comments;
					console.log(json);
					opg.ok(json);
				});
			});

		}
		else {
			btnAddMark.text('可以播放').prop('disabled', false).on('click' , () => {
				auditPlayer.toggle();
			});
		}


		//jump to the pointed time
		auditTable.tb.on('click', '.btn-info', evt => {
			let secs = +$(evt.currentTarget).data('time') as number;
			auditPlayer.jumpTo(secs);
		});


		//load data
		auditTable.data = data.commentArray; //[{"time": 96 ,"text":"gdf\nnn\n\nmm"}] ;

	};

	//'https://media.w3.org/2010/05/sintel/trailer.mp4';//
	auditPlayer.source = data.filePath ;

	$('#playerSection').css('visibility', 'visible');

}


export {MediaInfo}