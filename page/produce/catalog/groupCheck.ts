import opg from 'ts/opg.ts';


opg.api({
	queryContentGroups: 'admin/content/rel/queryContentGroups',
});

let checkedInfo = parent.window['checkedInfo'];
let checkedGroupData = checkedInfo.groups, checkedGroupDataHash = opg.convert.arrayToHash(checkedGroupData, 'id');

let tbSelected = opg('#selectedTb').table({
	data: checkedGroupData,
	columns: [
		{text: '已选分组', src: 'name'},
		{
			text: '操作', src: 'id', width: 60,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-danger" data-id="${val}" data-index="${i}">删除</button>`
			}
		},
	]
});

//remove the checked row
tbSelected.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), i = btn.data('index');
	checkedGroupData.splice(i, 1);
	checkedGroupDataHash = opg.convert.arrayToHash(checkedGroupData, 'id');
	tbSelected.update(checkedGroupData);
});


//
let tbGroup = opg('#groupTb').table({
	columns: [
		{text: '分组', src: 'name'},
		{
			text: '操作', src: 'id', width: 60,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info" data-id="${val}" data-index="${i}">添加</button>`
			}
		},
	],
	api: opg.api.queryContentGroups,
	pagination: {
		pageSize: 5,
		customizable: [5, 10, 20]
	}
});

//add selected row
tbGroup.tbody.on('click', '.btn-info', function () {
	let btn = $(this), i = btn.data('index'), obj = tbGroup.data[i];
	if (obj.id in checkedGroupDataHash) {
		return opg.alert(`“${obj.name}”已添加`);
	}
	else {
		checkedGroupData.push(obj);
		checkedGroupDataHash = opg.convert.arrayToHash(checkedGroupData, 'id');
		tbSelected.update(checkedGroupData);
	}

});


//search
$('#btnSearch').click(() => {
	tbGroup.update({groupName: $('#groupName').val()});
});


//click OK button
$('#btnSelectGroups').click(() => {
	checkedInfo.groups = checkedGroupData;
	checkedInfo.checkWin.close();
});