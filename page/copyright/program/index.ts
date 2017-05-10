import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import OpenDetail from './openDetail';


opg.api({
	'mainCategory!!': 'copyright/programType/findProgramtype',
	'subCategory!!': 'copyright/programType/findProgramtype/${parentId}',
	programs: 'copyright/program/findPage',
	contracts: 'copyright/program/findProgramContract/${programId}',
	'delete!DELETE!': 'content/contentType/delete/${id}'
});


const infoPage = '/page/content/contentType/info.html';

//wrap as search panel
let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '节目查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

//click to search
panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});


let selMainCategory = opg('#mainCategory').listBox({
	api: opg.api.mainCategory,
	text: 'programType',
	onSelect: () => {
		let parentId = selMainCategory.getValue();
		if (!parentId) parentId = -1;
		selSubCatagory.update({parentId});
	}
});
let selSubCatagory = opg('#minorCategory').listBox({
	lazy: true,
	api: opg.api.subCategory,
	text: 'programType',
});


//create a data table
let tb: Table = opg('#tb').table({
	api: opg.api.programs,
	columns: [
		{
			text: '节目名称',
			src: 'name',
			render: function (val, i, row) {
				return `<b class="ico-expandable ellipse" data-esd="${row.id}"></b> ${val}`;
			}
		},
		{
			text: '节目别名',
			src: 'name'
		},
		{
			text: '节目英文名',
			src: 'name'
		},
		{
			text: '节目主类',
			src: 'name',
			width: 100,
		},
		{
			text: '节目子类',
			src: 'name',
			width: 100,
		},
		{
			text: '集数',
			src: 'name',
			width: 90,
		},
		{
			text: '出品年代',
			src: 'name',
			width: 90,
		},
		{
			text: '更新时间',
			src: 'name',
			width: 90,
		},
		{
			text: '操作',
			src: 'name',
			width: 100,
			render: (val, i, row) => {
				return `
					<button class="btn-mini btn-warning btnEdit" data-id="${val}" data-title="${row.name}">修改</button>
					<button class="btn-mini btn-info btnView" data-id="${val}" data-title="${row.name}">查看</button>
					`;
			},
		},
		{
			text: '增加别名',
			src: 'name',
			width: 90,
			render: (val, i, row) => `<button class="btn-mini btn-info btnAlias" data-id="${val}" data-title="${row.name}">增加别名</button>`
		},
		{
			text: '介质管理',
			src: 'name',
			width: 90,
			render: (val, i, row) => `<button class="btn-mini btn-warning btnMedias" data-id="${val}" data-title="${row.name}">介质管理</button>`
		},
		{
			text: '删除',
			src: 'name',
			width: 60,
			render: (val, i, row) => `<button class="btn-mini btn-danger btnDelete" data-id="${val}" data-title="${row.name}">删除</button>`
		},
		{
			text: '关联内容',
			src: 'id',
			width: 90,
			render: (val, i, row) => `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">关联内容</button>`
		}
	],
	pagination: {
		pageSize: 10
	}
});


//expand subTable
tb.tbody.on('click', '.ico-expandable', function (e) {

	let cur = $(this), programId = cur.data('esd');
	let tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		opg.api.contracts({programId}, function (data) {
			if (data && data.length) {
				let th = $(`<tr class="subTHead esd_${programId}">
						<th>合同号</th><th>独占性</th><th>收费要求</th>
						<th>授权期限描述</th><th>版权开始时间</th><th>版权结束时间</th>
						<th>授权企业</th><th>授权地域</th><th>授权平台</th>
						<th>播出形式</th><th>版权方</th><th>录入人</th><th>项目负责人</th>
					</tr>`).insertAfter(tr);

				th.bindList({
					list: data,
					template: '<tr class="subTBody esd_' + programId + '">' +
					'<td>${programId}</td><td class="text-center">${createDate:=gDate}</td><td class="text-center">${contract:=gCtr}</td>' +
					'<td class="text-center">${copyrightTypeDesc}</td><td class="text-center">${copyrightBeginDate:=gDate}</td><td class="text-center">${copyrightEndDate:=gDate}</td>' +
					'<td class="text-center">${programId}</td><td class="text-center">${programId}</td><td class="text-center">${programId}</td>' +
					'<td class="text-center">${programId}</td><td class="text-center">${programId}</td><td class="text-center">${programId}</td><td class="text-center">${programId}</td>' +
					'</tr>',
					itemRender: {
						gCtr: function (contract) {
							if (contract)
								return contract.contractNumber;
							return '';
						},
						gDate: function (d) {
							return `${d.split(' ')[0]}`;
						}
					},
					mode: 'after'
				});

				cur.toggleClass('ellipse expanded');
			}
			else {
				opg.alert('没有合同信息');
			}
		})
	}
	else {
		cur.toggleClass('ellipse expanded');
		tr.nextAll('.esd_' + programId).remove();
	}

});


//Add new
$('#btnAdd').click(function () {
	OpenDetail.addNew(tb);
});

//medias
tb.tbody.on('click', '.btnMedias', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');
	OpenDetail.listMedias(id);
});

//edit
tb.tbody.on('click', '.btnEdit', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');
	OpenDetail.edit(tb, id);
});

//view
tb.tbody.on('click', '.btnView', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');
	OpenDetail.view(id);
});


//alias
tb.tbody.on('click' , '.btnAlias' , function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');
	OpenDetail.alias(id , title);
});

//delete
tb.tbody.on('click', '.btnDelete', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.danger(`要删除“<b>${title}</b>”吗？`, function () {
		opg.api.delete({id: id}, () => tb.update());
	}, {
		title: '请确认'
	});
});