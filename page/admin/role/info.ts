import ops from 'ts/ops';


ops.api({
	roleTree: 'system/role/${parentRoleId}',
	'findById!!': 'system/role/edit/${roleId}',
	'save!post': 'system/role/save'
});

ops.api['save'].set('codes', {
	'role_name_exist': '角色名已存在',
	'role_name_not_empty': '角色名称不能为空',
	'role_parentId_not_empty': '角色父id不能为空',
});

let form = $('#tbdSearch');
let tree2;

const id = ops.request['id'] ? ~~ops.request['id'] : null;
const parentRoleId = ~~ops.request['parentId'];

let permissions = {};
let reservedPermissionIdHash = {};


ops.api.roleTree({parentRoleId}, (data)=> {

	let actions = data.actions, x = actions.length;
	while (x--) {
		let p = actions[x];
		if (!permissions[p.parentId]) {
			permissions[p.parentId] = [];
		}
		permissions[p.parentId].push(p);
	}

	let menuData = data.menu ? data.menu : [];

	function loopNode(list :Array) {
		let z = list.length;
		while (z--) {
			let node = list[z];
			if (node.id in permissions) {
				node.children = permissions[node.id];
			}
			if (node.children) {
				loopNode(node.children);
			}
		}
	}

	loopNode(menuData);

	console.log('permissions', permissions);


	tree2 = ops('#menuTree').tree({
		data: menuData,
		root: '菜单列表',
		cmd: 'checkAll'
	});

	/*tree2.jq.on('change', ':checkbox', function (e) {
	 let elem = $(this), pId = ~~elem.val(), deal = elem.prop('checked');
	 //console.warn('deal' , this);
	 if (deal) {
	 reservedPermissionIdHash[pId] = true;
	 }
	 else {
	 delete reservedPermissionIdHash[pId];
	 }
	 });*/


	if (id) {

		ops.api.findById({roleId: id}, function (data) {
			form.jsonToFields(data.role);

			let checkedIds = data.checkedIds ? data.checkedIds : [];
			checkedIds.map((v)=> {
				reservedPermissionIdHash[v] = v;
			});

			console.log('checkedIds', reservedPermissionIdHash);


			if (data.checkedIds) {
				//选中全部被选择的
				let l = data.checkedIds.length;
				while (l--) {
					let curId = data.checkedIds[l];
					let chk = document.getElementById(`tree${tree2.guid}Chk_${curId}`);
					if (chk) {
						$(chk).prop('checked', true);
						delete reservedPermissionIdHash[curId];
					}
				}

				console.warn('reservedPermissionIdHash', data, reservedPermissionIdHash);


				//将子节点选中的条数与全部子节点比较
				l = data.checkedIds.length;
				while (l--) {

					let sp = $('#tree' + tree2.guid + 'Sp_' + data.checkedIds[l]);

					if (sp.hasClass('folder')) {
						let ul = $('#tree' + tree2.guid + 'Ul_' + data.checkedIds[l]);
						/*let li = ul.children('li');
						 let all = li.length;
						 if (all != li.children('span').children('label').children(':checkbox:checked').length) {
						 //console.error('uncheck' , data.checkedIds[l] , all , li.children('span').children(':checkbox:checked').length);
						 $('#tree' + tree2.guid + 'Chk_' + data.checkedIds[l]).prop('checked', false);
						 }*/

						ul.find(':checkbox').prop('checked', true);
					}

				}

			}


		});
	}
});


window['doSave'] = function (popWin, tree) {

	let param = form.fieldsToJson({
		roleName: {
			name: '角色名称',
			type: 'ns',
			require: true
		},
		roleDesc: {
			name: '角色描述',
			maxLength: 80
		}
	});

	if (!param)
		return true;

	let ids = {}, unsetIds = {};
	let backThroughChildren = (chk)=> {
		let childCheck = $(chk).closest('.folder').siblings('ul').find(':checkbox:checked');
		childCheck.each((i, elem :HTMLInputElement) => {
			unsetIds[elem.value] = 1;
		});
	};

	tree2.jq.find(':checkbox:checked').each((i, elem)=> {
		//backThroughParent(elem, ids);
		if (!ids[elem.value] && !unsetIds[elem.value]) {
			ids[elem.value] = 1;
		}

		if ($(elem).closest('span').hasClass('folder')) {
			backThroughChildren(elem);
		}
	});

	let menuIds = ops.convert.hashKeysToArray(ids);
	let reservedPermissions = ops.convert.hashKeysToArray(reservedPermissionIdHash);

	param.pIds = ops.array.unique(ops.array.combine(menuIds, reservedPermissions));


	param.id = id;
	param.parentId = ~~ops.request['parentId'];

	console.log('param', param);


	ops.api.save(param, function () {
		popWin.close();
		tree.update();
	});

	return true;

};


/*
 function backThroughParent(chk, ids) {
 if (!ids[chk.value]) {

 ids[chk.value] = chk.value;

 let parentCheck = $(chk).closest('ul').siblings('.folder').find(':checkbox');
 if (parentCheck.length) {
 let elem = parentCheck[0] as HTMLInputElement;
 //ids[elem.value] = true;
 backThroughParent(elem, ids);
 }
 }
 //若有设过,则表明这个节点已被回溯过,无需再次
 }*/
