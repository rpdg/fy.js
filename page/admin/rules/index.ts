import opg from 'ts/opg.ts';
import Panel from 'ts/ui/Panel.ts';


opg.api({
	rules: 'produce/rule/findPage',
	produceRuleTypes: 'base/produceRuleTypes', //规则类型
	'delete!DELETE!': 'produce/rule/delRule/${id}',
});


const infoPage = '/page/admin/rules/rule.html';


let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '规则查询',
	btnSearchText: '<i class="ico-find"></i> 查询',
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});


//规则类型
opg('#type').listBox({
	api: opg.api.produceRuleTypes,
	onAjaxEnd: (json) => {
		json.results = opg.convert.hashToArray(json, (val, key) => {
			return {name: val, code: key};
		});
		console.log(json);
	},
	value: 'code',
});

let tb = opg('#tb').table({
	api: opg.api.rules,
	titleBar: {
		title: '生产规则',
		buttons: [
			{id: 'btnAdd', className: 'btn-create', html: '<i class="ico-create"></i> 新增规则'},
		],
	},
	columns: [
		{
			text: '规则名称', width: 300,
			src: 'name',
		},
		{
			text: '规则类型',
			src: 'typeDesc',
		},
		{
			src: 'id', text: '操作', width: 250,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-primary btnEditRule" data-id="${val}" data-title="${row.name}">修改规则</button> 
						<button class="btn-mini btn-info btnEditCfg" data-id="${val}" data-title="${row.name}">修改配置</button> 
						<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`;
			},
		},
	],
	//lazy: true,
	pagination: {
		pageSize: 10,
	},
});

//Add a new rule
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg.confirm(`<iframe src="${infoPage}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增规则',
		btnMax: true,
		width: 640,
		height: 360,
		buttons: {
			ok: '保存新增规则',
			cancel: '取消',
		},
	});

	//console.log(pop);
});

//edit a rule
tb.tbody.on('click', '.btnEditRule', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `修改规则: ${title}`,
		btnMax: true,
		width: 640,
		height: 360,
		buttons: {
			ok: '保存修改',
			cancel: '取消',
		},
	});
});


//edit config
tb.tbody.on('click', '.btnEditCfg', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg(`<iframe src="/page/admin/rules/config/index.html?id=${id}" />`).popup({
		title: `编辑配置: ${title}`,
		btnMax: true,
		width: 760,
		height: 520,
		callback : function (i, ifr) {
			return ifr.doSave(pop, tb);
		}
	}) ;
});


//delete a rule
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.danger(`要删除规则 “<b>${title}</b>” 吗？`, function () {
		opg.api.delete({id: id}, () => tb.update());
	}, {
		title: '请确认',
	});
});