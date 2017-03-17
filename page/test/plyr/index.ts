import opg from 'ts/opg.ts';

import AuditPlayer from './AuditPlayer';
import AuditTable from './AuditTable';


opg.api({
	saveAudit: ''
});


const SVG_PATH = __uri('plyr.svg');

//button to add mark
let btnAddMark = $('#btnMark');

//button to save data
let btnSave = $('#btnSave');



let auditTable = new AuditTable('tbMarkBody', SVG_PATH);

let auditPlayer = new AuditPlayer('my-video', SVG_PATH);

auditPlayer.onVideoReady = ()=> {

	//enable the add mark button
	btnAddMark.text('添加审核意见').addClass('btn-warning').prop('disabled', false);

	//add a remark
	btnAddMark.on('click', () => {
		auditPlayer.pause();
		auditTable.appendRow(auditPlayer.currentTime);
	});

	//remove the remark entry
	auditTable.tb.on('click', '.btn-danger', evt => {
		//auditTable.removeRowByTime(+$(evt.currentTarget).data('time') as number);
		auditTable.removeRowById($(evt.currentTarget).data('tid'));
	});

	//jump to the pointed time
	auditTable.tb.on('click', '.btn-info', evt => {
		let secs = +$(evt.currentTarget).data('time') as number;
		auditPlayer.jumpTo(secs);
	});

	//save data
	btnSave.on('click', () => {
		console.log( JSON.stringify(auditTable.data)) ;
	});


	//load data
	auditTable.data = [{"time": 96 ,"text":"gdf\nnn\n\nmm"}] ;

};


auditPlayer.source = 'https://media.w3.org/2010/05/sintel/trailer.mp4';


