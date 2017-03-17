import opg from 'ts/opg';

opg.api({
	templates: 'admin/template/findPage',
	'delete!GET!': 'admin/template/deleteById?id=${id}'
});


const infoPage = '/page/collection/templates/template.html';


//create a data table
let tb = opg('#tb').table({
	api: opg.api.templates,
	columns: [
		{
			text: '模板名称',
			width: 200,
			src: 'name'
		},
		{
			text: '描述',
			src: 'description'
		},
		{
			text: '操作',
			src: 'id',
			width: 160,
			render: (val, i, row)=> {
				return `
					<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">修改</button> 
					<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button> 
					<button class="btn-mini btnView" data-id="${val}" data-title="${row.name}">查看</button>
				`;
			}
		}
	],
	pagination: {
		pageSize: 10
	}
});


//Add
$('#btnAdd').click(function () {

	let pop = top.opg.confirm(`<iframe src="${infoPage}" />`, function (i, ifr) {
		ifr.doSave(pop, tb);
		return true ;
	}, {
		title: '新增模板',
		btnMax: true,
		width: 680,
		height: 500,
		buttons: {
			ok: '保存新增',
			cancel: '取消'
		}
	});

});

//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	let pop = top.opg.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		ifr.doSave(pop, tb);
		return true ;
	}, {
		title: `修改模板: ${title}`,
		btnMax: true,
		width: 680,
		height: 500,
		buttons: {
			ok: '保存修改',
			cancel: '取消'
		}
	});
});

//view only
tb.tbody.on('click', '.btnView', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.popTop(`<iframe src="${infoPage}?id=${id}" />` , {
		title: `查看模板: ${title}`,
		btnMax: true,
		width: 680,
		height: 500,
	});
});


//delete
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.danger(`要删除“<b>${title}</b>”吗？`, function () {
		opg.api.delete({id: id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});