import opg from 'ts/opg.ts';

const ruleId = +opg.request['id'];

opg.api({
	configTypes: 'base/produceConfigTypes', //配置关系类型
	conditionKeys: 'base/produceConditionKeys', //配置条件类别类型
	conditionTypes: 'base/produceConditionTypes', //配置条件关系类型
	'addConfig!post': 'produce/rule/saveConfig',//
});


interface Condition {
	key: string ;
	value: string;
	type: string;
}

let conditions: Condition[] = [];

opg('#configType').listBox({
	api: opg.api.configTypes,
	autoPrependBlank: false,
	onAjaxEnd: (json) => {
		json.results = opg.convert.hashToArray(json, (val, key) => {
			return {name: val, id: key};
		});
		//console.log(json);
	},
});


let keyHTML: string = '';
let typeHTML: string = '';


$.when(
	opg.api.conditionKeys((data) => {
		for (let key in data) {
			keyHTML += `<option value="${key}">${data[key]}</option>`;
		}

	}),
	opg.api.conditionTypes((data) => {
		console.log(data);
		for (let key in data) {
			typeHTML += `<option value="${key}">${data[key]}</option>`;
		}

	}),
).done(function () {
	let formHTML = `
	<table id="divPnl">
		<tr>
			<td><select id="conditionKey">
				${keyHTML}
			</select></td>
			<td><select id="conditionType">
				${typeHTML}
			</select></td>
			<td><input id="conditionValue" type="text"></td>
		</tr>
	</table>`;

	let tdConfig = $('#tdConfig');

	let generateConfig = function () {
		let selKey = $('#conditionKey')[0] as HTMLSelectElement;
		let selType = $('#conditionType')[0] as HTMLSelectElement;
		let selValue = $('#conditionValue').val() || '空';

		let condition: Condition = {
			key: selKey.options[selKey.selectedIndex].value,
			type: selType.options[selType.selectedIndex].value,
			value: selValue,
		};

		conditions.push(condition);

		tdConfig.append(`<p>${selKey.options[selKey.selectedIndex].text} ${selType.options[selType.selectedIndex].text} ${selValue}</p>`);

		console.log(conditions);
	};


	$('#btnAddConfig').click(function () {
		opg.confirm($(formHTML), generateConfig, {
			title: null,
			width: 480,
			btnMax: false,
		});
	});

	$('#btnClearConfig').click(function () {
		conditions.length = 0;
		tdConfig.empty();
	});

})
;


window['doSave'] = function (popWin, table) {
	if (conditions.length < 1)
		return opg.warn('配置条件不可为空');

	let param = {ruleId, type: +$('#configType').val(), conditions};

	console.log(param);

	//return;

	return opg.api.addConfig(param, function () {
		popWin.close();
		table.update();
	});
};