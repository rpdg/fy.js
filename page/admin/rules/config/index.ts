import opg from 'ts/opg.ts';
import Panel from 'ts/ui/Panel.ts';


const ruleId = opg.request['id'];


opg.api({
	rules: 'produce/rule/findConfigs?ruleId=' + ruleId,
	produceRuleTypes: 'base/produceRuleTypes', //规则类型
	conditionKeys: 'base/produceConditionKeys', //配置条件类别类型
	'delete!DELETE!': 'produce/rule/delConfig/${id}',
	'batchDelete!post': 'produce/rule/batchDelConfig',
});


let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '生产任务查询',
	btnSearchText: '<i class="ico-find"></i> 查询',
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});





let configKeys;
opg.api.conditionKeys((data) => {
	configKeys = data;
	tb.update();
});

let tb = opg('#tb').table({
	api: opg.api.rules,
	lazy: true,
	columns: [
		{
			text: ' ',
			src: 'id', cmd: 'checkAll',
		},
		{
			text: '条件', align: 'left',
			src: 'name',
			render: (val, i, row) => {
				let html = '';
				let conditions = row.conditions || [];
				for (let i = 0, l = conditions.length; i < l; i++) {
					let con = conditions[i];
					console.log(configKeys, con);
					html += `${configKeys[con.key]}${con.typeDesc}“${con.value}”　`;
				}
				return html;
			},
		},
		{
			text: '类型', width: 100,
			src: 'typeDesc',
		},
		{
			src: 'id', text: '操作', width: 90,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`;
			},
		},
	],
	//lazy: true,
	pagination: {
		pageSize: 5,
		customizable: [5, 10],
	},
});


//Add a new config
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg.confirm(`<iframe src="/page/admin/rules/config/add.html?id=${ruleId}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增条件',
		btnMax: false,
		width: 600,
		height: 360,
		buttons: {
			ok: '保存新增条件',
			cancel: '取消',
		},
	});

	//console.log(pop);
});


//批量删除
$('#btnBatchDelete').click(function () {
		let checked = tb.getCheckedValue();
		if (checked && checked.length) {
			console.log(checked);
			opg.danger(`要删除这${checked.length}项配置吗？`, function () {
				opg.api.batchDelete({configIds: checked.join(',')}, function () {
					tb.update();
				});
			}, {
				title: '请确认',
			});
		}
		else {
			opg.warn(`请选择配置`);
		}

	},
);


//delete a config
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.danger(`要删除该项配置吗？`, function () {
		opg.api.delete({id}, () => tb.update());
	}, {
		title: '请确认',
	});
});