import opg from 'ts/opg.ts';


opg.api({
	'mainCategory!!': 'copyright/programType/findProgramtype',
	'subCategory!!': 'copyright/programType/findProgramtype/${parentId}',
	'findById!!': 'transcode/business/findById/${id}',
});

//集数区间
let iptEpisodes = $('#episodes').decimalMask('9999');
let episodeStart = $('#episodeStart').decimalMask('9999');
let episodeEnd = $('#episodeEnd').decimalMask('9999');


//入库时间
$('#putInTime').datetimepicker({
	closeOnDateSelect: true,
	timepicker: false,
	format: 'Y-m-d',
});

