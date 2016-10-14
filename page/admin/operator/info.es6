import {ops , $} from '/es6/ops';


ops.api({
	'loadInfo' : 'roleInfo.json',
	saveInfo : 'success.json',
	roles: 'roles.json'
});


ops('#menuTree').tree({
	api: ops.api.roles,
	root: '权限',
	cmd: 'checkAll' ,
	onCreate : loadRoleInfo
});

function loadRoleInfo() {
	if(ops.request['id']){
		ops.api.loadInfo({id : ops.request['id']} , function (data) {
			$('#tbSearch').jsonToFields(data);
		});
	}
}



window.doSave = function (popWin , tree) {

	ops.api.saveInfo(function () {
		popWin.close();
		tree.update();
	});

	return true;

};