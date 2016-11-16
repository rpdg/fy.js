import ops from 'ts/ops';


ops.api({
	roles: 'system/role/list',
	'delete!delete!': 'system/role/delete/${roleId}'
});

ops.api.delete.set('codes', {
	'role_blind_users': '该角色绑定有用户，不能删除',
	'role_have_child': '该角色有子角色，不能删除',
});

const infoPage = '/page/admin/role/info.html';
let subNodeParentId = 0;
let nodeParentId = 0;
let rootAdminId = 0;

let tree = ops('#leftSec').tree({
	api: ops.api.roles,
	root: '角色',
	onAjaxEnd: (json)=> {
		console.log(json);

		let d = json;
		json.results = [d];

		//console.log(tree);
		//tree.rootName = d.name;
	},
	onCreate: function () {
		tree.root.find('li:eq(0)').find('.sp:eq(0)').click();
	},
	onUpdate: function () {
		$('#tree' + tree.guid + 'Sp_' + tree.prevItemId).trigger('click');
	}
	//template : '<a href="#1"> ${name}</a>',
	//cmd : 'checkAll'
});


let panel = ops.wrapPanel('#tbSearch', {
	title: '角色信息',
	btnSearchText: '<i class="ico-edit"></i> 修改'
});

panel.btnSearch.click(function () {
	editRole.call(this, true);
});


//console.log(panel.jq);
let roleNameSp = $('#roleName');
let roleDescSp = $('#roleDesc');
let btnAdd = $('#btnAdd');

//Add new
btnAdd.click(function () {

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.ops.confirm(`<iframe src="${infoPage}?parentId=${subNodeParentId}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tree);
	}, {
		title: '新增角色',
		btnMax: true,
		width: 780,
		height: 520,
		buttons: {
			ok: '保存新增',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

//console.log(new Set([1,2]));
//
tree.jq.on('click', '.sp', function () {

	let id = ~~tree.selectedItemId, data = tree.getSelectedData() || tree.data;

	console.log('data' , data);

	nodeParentId = data.parentId;
	subNodeParentId = id || data[0].id;

	if (id) {

		panel.btnSearch.data({'id': id, 'title': data.name});
		tb.update(data.children || []);


		roleNameSp.text(data.name);
		roleDescSp.text(data.description || '');
		//panel.jq.show();
		//btnAdd.show();
	}
	else {
		/*panel.jq.hide();
		btnAdd.hide();
		tb.update(tree.data);*/
	}

	if(id){
		let clickedSp = $(this);
		if(clickedSp.closest('ul').closest('li').hasClass('rootLi')){
			panel.btnSearch.hide();
		}
		else{
			panel.btnSearch.show();
		}
	}
});

let tb = ops('#tb').table({
	columns: [
		{
			text: '角色名称', width: 200,
			src: 'name'
		},
		{
			text: '角色描述',
			src: 'description'
		},
		{
			src: 'id', text: '操作', width: 120,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">修改</button> 
						<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`
			}
		}
	],
	lazy: true
});

//edit
tb.tbody.on('click', '.btn-info', function () {
	editRole.call(this, false);
});

function editRole(isParentNode: boolean) {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}&parentId=${isParentNode ? nodeParentId : subNodeParentId}" />`, function (i, ifr) {
		return ifr.doSave(pop, tree);
	}, {
		title: `修改角色: ${title}`,
		btnMax: true,
		width: 780,
		height: 520,
		buttons: {
			ok: '保存修改',
			cancel: '取消'
		}
	});
}

//del
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), roleId = btn.data('id');

	ops.danger(`要删除“<b>${title}</b>”吗？`, function () {
		ops.api.delete({roleId}, ()=> {
			tree.update();
		});
	}, {
		title: '请确认'
	});
});


