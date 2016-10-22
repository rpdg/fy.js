import ops from 'ts/ops.ts';
import Tree from "ts/ui/Tree.ts";


ops.api({
	org: 'system/organization/orgsubstree/0',
	'delete!delete!': 'system/organization/delete/${id}'
});


const infoPage = '/page/admin/org/info.html';


var panel = ops.wrapPanel('#tbSearch', {
	title: '组织信息',
	btnSearchText: '<i class="ico-edit"></i> 修改'
});

panel.btnSearch.click(editRole);

//console.log(panel.jq);
var roleNameSp = $('#roleName');
var btnAdd = $('#btnAdd');

btnAdd.click(function () {
	//var pId = btnAdd.data('pid');
	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}?parentId=${currentTableParentId}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tree);
	}, {
		title: '新增组织',
		btnMax: true,
		width: 500,
		height: 200,
		buttons: {
			ok: '保存新增',
			cancel: '取消'
		}
	});

	//console.log(pop);
});


var tb = ops('#tb').table({
	columns: [
		{
			text: '组织名称', width: 200,
			src: 'name'
		},
		{
			text: '组织编码',
			src: 'description'
		},
		{
			src: 'id', text: '操作', width: 120,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info" data-id="${val}" data-pid="${currentTableParentId}" data-title="${row.name}">修改</button> 
						<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>`
			}
		}
	],
	lazy: true
});

//edit
tb.tbody.on('click', '.btn-info', editRole);

function editRole() {
	var btn = $(this), title = btn.data('title'), id = btn.data('id'), pId = btn.data('pid');
	//noinspection TypeScriptUnresolvedVariable
	var pop = top.ops.confirm(`<iframe src="${infoPage}?id=${id}&parentId=${pId}" />`, function (i, ifr) {
		return ifr.doSave(pop, tree);
	}, {
		title: `修改组织: ${title}`,
		btnMax: true,
		width: 500,
		height: 200,
		buttons: {
			ok: '保存修改',
			cancel: '取消'
		}
	});
}


//del
tb.tbody.on('click', '.btn-danger', function () {
	var btn = $(this), title = btn.data('title'), id = btn.data('id');

	ops.danger(`要删除“<b>${title}</b>”吗？`, function () {
		ops.api.delete({id}, ()=> {
			tree.update();
		});

	}, {
		title: '请确认'
	});
});

var currentTableParentId = -1;

var tree: Tree = ops('#leftSec').tree({
	root: '系统企业',
	api: ops.api.org,
	onAjaxEnd: (json)=> {
		console.log(json);
		json.results = json.root.children;
	},
	onCreate: function () {
		//console.log(tree, this);

		var tree = this;

		this.jq.on('click', '.sp', function () {

			var id = tree.selectedItemId || -1, data = tree.getSelectedData() || tree.data;
			currentTableParentId = id;

			if (id > 0) {
				panel.jq.show();

				var parentId = tree.currentLi.parent().attr('id').split('Ul_')[1] || -1;

				panel.btnSearch.data({'id': id, title: data.name, 'pid': parentId});

				btnAdd.show();
				//console.log(parentId);
				tb.update(data.children || []);
				roleNameSp.text(data.name);
			}
			else {
				/*panel.jq.hide();
				btnAdd.hide();
				tb.update(tree.data);*/
			}

		});

		tree.root.find('li:eq(0)').find('.sp:eq(0)').click();

	},
	onUpdate: function () {
		$('#tree' + tree.guid + 'Sp_' + tree.prevItemId).trigger('click');
	}
	//template : '<a href="#1"> ${name}</a>',
	//cmd : 'checkAll'
});
