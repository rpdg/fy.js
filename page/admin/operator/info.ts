import ops from 'ts/ops';

ops.api({
	roles: 'system/role/list',
	org: 'system/organization/orgsubstree/0',
	'findById!!': 'system/user/edit/${id}',
	'save!post': 'system/user/save',
});

ops.api.save.set('codes' , {
	'loginName_exist' : '登录名已经存在'
});

const id = ops.request['id'];
let reservedCheckedRolesHash = {};

let form = $('#tbSearch');

let tree1;//, tree2;
$.when(
	ops.api.roles(data => {
		let d = data;
		data.results = [d];

		tree1 = ops('#tree1').tree({
			data: data,
			root: '角色',
			name : 'rolesTree' ,
			cmd: 'checkAll'
		});

		/*tree1.jq.on('change', ':checkbox', function () {
			let elem = $(this), pId = elem.val(), deal = elem.prop('checked');
			//console.warn('deal' , this);
			if (deal) {
				reservedCheckedRolesHash[pId] = true;
			}
			else {
				delete reservedCheckedRolesHash[pId];
			}
		});*/
	})/*,
	 ops.api.org(data => {
	 let treeDiv = $('<div id="tree2"></div>').appendTo('#lbOrg');
	 tree2 = ops(treeDiv).tree({
	 data: data.root.children,
	 root: data.root.name,
	 text: 'name',
	 value: 'id',
	 combo: {
	 textField: '#org',
	 valueField: '#orgCode',
	 }
	 });
	 tree2.jq.on('click', function () {
	 tree2.combo.close();
	 });
	 })*/
).done(()=> {
	if (id) {
		ops.api.findById({id: id}, data => {
			form.jsonToFields(data);

			if (data.roleIds) {
				let checkedIds = data.roleIds;
				checkedIds.map(v => {
					reservedCheckedRolesHash[v] = true;
				});
				console.warn('findById', data, reservedCheckedRolesHash);

				//选中全部被选择的
				let l = data.roleIds.length;
				while (l--) {
					$('#tree' + tree1.guid + 'Chk_' + data.roleIds[l]).prop('checked', true);
				}
				//将子节点选中的条数与全部子节点比较
				l = data.roleIds.length;
				while (l--) {
					let curRoleId = data.roleIds[l];
					let sp = $('#tree' + tree1.guid + 'Sp_' + curRoleId);

					if(sp.length){

						if (sp.hasClass('folder')) {
							let ul = $('#tree' + tree1.guid + 'Ul_' + curRoleId);
							ul.find(':checkbox').prop('checked' , true);
						}

						delete reservedCheckedRolesHash[curRoleId];
					}

				}
			}
		});
	}
	else {
		$('#trRoleTree').before(`<tr style="height: 32px;">
									<td class="lead"><b class="text-red">*</b>用户密码</td>
									<td colspan="3"><label><input type="password" name="password" autocomplete="off" placeholder="密码8-15位，大小写字母与数字混合" style="width: 100%;"></label></td>
								</tr>`);
	}
});


window['doSave'] = function (popWin, table) {

	let rules = {
		loginName: {
			name: '登录名',
			type: 'ns',
			require: true
		},
		name: {
			name: '用户名',
			type: 'ns',
			require: true
		}
	};

	if (!id) {
		rules['password'] = {
			type: 'password'
		}
	}

	let param = form.fieldsToJson(rules);

	if (!param)
		return true;

	let ids = {} , unsetIds = {};
	let backThroughChildren = (chk)=>{
		let childCheck = $(chk).closest('.folder').siblings('ul').find(':checkbox:checked');
		//childCheck.prop('disabled' , true);
		childCheck.each((i , elem :HTMLInputElement)=>{
			//delete ids[chk.value];
			unsetIds[elem.value] = 1;
		});
	};
	tree1.jq.find(':checkbox:checked').each((i, elem)=> {
		//backThroughParent(elem, ids);

		if (!ids[elem.value] && !unsetIds[elem.value]) {
			ids[elem.value] = 1;
		}

		if($(elem).closest('span').hasClass('folder')){
			backThroughChildren(elem);
		}
	});


	let checkedRoleIds = ops.convert.hashKeysToArray(ids);
	let reservedCheckedRoles = ops.convert.hashKeysToArray(reservedCheckedRolesHash);

	param.roleIds = ops.array.unique(ops.array.combine(checkedRoleIds, reservedCheckedRoles));


	if(!param.roleIds.length){
		ops.warn('请选择角色');
		return true;
	}

	if (id)
		param.id = id;

	for (let k in param) {
		if (k.indexOf('_') > -1) {
			delete param[k];
		}
	}

	return ops.api.save(param, ()=> {
		popWin.close();
		table.update();
	});

};



/*let backThroughParent = (chk, ids)=> {
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
 };*/

