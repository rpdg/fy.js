import opg from 'ts/opg.ts';
import {store, Cache} from 'ts/util/store';
import Table from 'ts/ui/Table.ts';
import {Combo} from 'ts/ui/Combo' ;
import PopUp from 'ts/ui/Popup';


opg.api({
	'findProgramContract!!': 'copyright/contract/findProgramContract/${relCopyrightProgramId}',
	authCorp: 'copyright/authCorp/findPage?pageSize=10000', //授权企业
	platform: 'copyright/platform/findPage?pageSize=10000', //授权平台
	copyrightTypes: 'base/copyrightTypes', //版权类型
	transmitModes: 'base/transmitModes', //播出形式
	'updateContract!post': 'copyright/contract/updateCopyrightContract', //修改保存合同
});


const isEdit: boolean = (opg.request['edit'] == 1);
const relCopyrightProgramId = isEdit ? opg.request['relContractProgramId'] : null;
let contractId = isEdit ? null : opg.request['contractId'];
let contractNumber = isEdit ? null : opg.request['contractNumber'];


let contractFullMeta;


//日期选择
const dataPickerOption = {
	timepicker: false,
	closeOnDateSelect: true,
	format: 'Y-m-d',
};
$('#copyrightBeginDate').datetimepicker(dataPickerOption);
$('#copyrightEndDate').datetimepicker(dataPickerOption);
$('#shareMoneyBeginDate').datetimepicker(dataPickerOption);
$('#shareMoneyEndDate').datetimepicker(dataPickerOption);


//授权地域
let authorizedRegionName = $('#authorizedRegionCNDesc');
let authorizedRegionId = $('#authorizedRegionId');
Combo.makeClearableInput(authorizedRegionName, authorizedRegionId);
$('#btnAuthorizedRegion').click(function () {
	top.opg.confirm(`<iframe src="/page/copyright/contract/module/regions.html" />`, function (i, ifr) {
		let rows = ifr.getChecked();
		if (rows) {
			let names = [], ids = [];
			rows.map(function (row, i) {
				names[i] = row.name;
				ids[i] = row.id;
			});
			authorizedRegionName.val(names.join(','));
			authorizedRegionId.val(ids.join(','));
		}
		return !rows;
	}, {
		title: '选择地域',
		btnMax: true,
		width: 500,
		height: 600,
	});
});


//节目选择
let programName = $('#programName');
let programId = $('#programId');
Combo.makeClearableInput(programName, programId);
$('#btnCopyrightProgram').click(function () {
	top.opg.confirm(`<iframe src="/page/copyright/contract/module/programs.html" />`, function (i, ifr) {
		let program = ifr.getChecked();
		if (program) {
			//console.log(program);
			program.programName = program.name;
			program.programId = program.id;
			$('#tbdProgram').jsonToFields(program);
		}
		return !program;
	}, {
		title: '选择节目',
		btnMax: true,
		width: 800,
		height: 600,
	});
});


let copyrightType;

$.when(
	opg.api.authCorp((data) => {
		opg('#tdAuthCorp').checkBox({
			data: data,
			name: 'authorizedCorp[]',
			value: 'corpId',
		});
	}),

	opg.api.platform((data) => {
		opg('#tdPlatform').checkBox({
			data: data,
			name: 'authorizedPlatform[]',
			value: 'platformId',
		});
	}),

	opg.api.copyrightTypes((data) => {

		copyrightType = data;

		opg('#selCopyrightType').listBox({
			data: opg.convert.hashToArray(data, (val, key) => {
				return {id: key, name: val};
			}),
		});
	}),

	opg.api.transmitModes((data) => {
		opg('#tdTransmitMode').checkBox({
			data: opg.convert.hashToArray(data, (val, key) => {
				return {id: key, name: val};
			}),
			name: 'transmitMode[]',
		});
	}),

).done(() => {

	if (isEdit) {
		$('.forCreat').remove();


		opg.api.findProgramContract({relCopyrightProgramId}, (data) => {
			contractFullMeta = data;
			contractId = data.contractId;
			contractNumber = data.contractNumber;

			let contract = data.contract || {};
			let program = data.program || {};

			$('#tbdProgram').jsonToFields(program);
			$('#tbdContract').jsonToFields(contract);

			//
			data.authorizedCorp = data.authorizedCorp ? data.authorizedCorp.split(',') : [];
			data.authorizedPlatform = data.authorizedPlatform ? data.authorizedPlatform.split(',') : [];
			data.transmitMode = data.transmitMode ? data.transmitMode.split(',') : [];

			data.copyrightBeginDate = shortenDate(data.copyrightBeginDate);
			data.copyrightEndDate = shortenDate(data.copyrightEndDate);
			data.shareMoneyBeginDate = shortenDate(data.shareMoneyBeginDate);
			data.shareMoneyEndDate = shortenDate(data.shareMoneyEndDate);

			$('#tbd').jsonToFields(data);

			$('#copyrightRealBeginDate').text(shortenDate(data.copyrightRealBeginDate));
			$('#copyrightRealEndDate').text(shortenDate(data.copyrightRealEndDate));
			$('#copyrightType').text(copyrightType[data.copyrightType]);
			//$('#spTransmitMode').text(data.transmitModeCNDesc);
			//$('#chargeRequire').text(data.chargeRequire);
			//$('#authorizedLifeDesc').text(data.authorizedLifeDesc);
		});
	}
	else {
		$('.forEdit').remove();

		const currentUser = store.get('userInfo');
		$('#personInCharge').val(currentUser.name);
		$('#contractNumber').val(contractNumber);

	}
});

function shortenDate(str : string) :string{
	if(str)
		return str.split(' ')[0];
	return str;
}

window['doSave'] = function (pop: PopUp, tb: Table, nextStep ?: Function) {
	let param = $('#tbForm').fieldsToJson({
		copyrightBeginDate: {
			name: '版权开始日',
			type: 'date',
			require: true,
		},
		copyrightEndDate: {
			name: '版权到期日',
			type: 'date',
			require: true,
		},
	});

	if (param) {

		let programId = $('#programId').val();
		if (!programId) {
			$('#programName').iptError('请选择节目');
		}
		else if (!param.authorizedPlatform) {
			$('#tdPlatform').iptError('请选择授权平台');
		}
		else {
			param.programId = programId;

			delete param.id;
			delete param.name;
			delete param.enName;
			delete param.mainCategoryDesc;
			delete param.minorCategoryDesc;
			delete param.produceYear;
			delete param.nation;
			delete param.episodes;
			delete param.lengthOfEpisode;

			delete param.contractNumber;
			delete param.authorizedRegionCNDesc;


			param.contractId = contractId;

			if (param.authorizedPlatform)
				param.authorizedPlatform = param.authorizedPlatform.join(',');

			if (param.authorizedCorp)
				param.authorizedCorp = param.authorizedCorp.join(',');

			if (param.transmitMode)
				param.transmitMode = param.transmitMode.join(',');

			if (param.authorizedRegionId)
				param.authorizedRegion = param.authorizedRegionId;
			delete param.authorizedRegionId;


			if(param.copyrightBeginDate)
				param.copyrightBeginDate += ' 00:00:00';
			if(param.copyrightEndDate)
				param.copyrightEndDate += ' 00:00:00';
			if(param.shareMoneyBeginDate)
				param.shareMoneyBeginDate += ' 00:00:00';
			if(param.shareMoneyEndDate)
				param.shareMoneyEndDate += ' 00:00:00';


			if (isEdit) {
				param.relContractProgramId = relCopyrightProgramId;

				param.copyrightType = contractFullMeta.copyrightType;
				param.copyrightRealBeginDate = contractFullMeta.copyrightRealBeginDate;
				param.copyrightRealEndDate = contractFullMeta.copyrightRealEndDate;

				console.log(param, contractFullMeta);
			}
			else {

				if (!param.copyrightType) {
					$('#selCopyrightType').iptError('请选择版权类型');
				}


				console.log(param);
			}

			//return;

			opg.api.updateContract(param, function () {
				if (!isEdit) {
					opg.ok(`合同"${contractNumber}"节目新增成功`);
				}
				tb.update();
				pop.close();

				if (nextStep)
					nextStep(contractId, tb);
				else {
				}
			});
		}
	}
};


