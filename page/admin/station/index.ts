import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel";


opg.api({
	station: 'system/station/findPage',
	orgTree: 'system/organization/orgsubstree/0',
	mediaTypes: 'system/movietype/findAll',
	interfaceVersions: 'base/interfaceVersions',
	'delete!DELETE!': 'system/station/delete/${id}' ,
	'switch!put!': 'system/station/updateStatus/${id}' ,
});


const infoPage = '/page/admin/station/info.html';


let panel: Panel = opg.wrapPanel('#tbSearch', {
	title: '渠道查询',
	btnSearchText: '<i class="ico-find"></i> 查询'
});

panel.btnSearch.click(function () {
	let param = $('#tbSearch').fieldsToJson();
	param.pageNo = 1;
	//console.log(panel.jq, param);
	tb.update(param);
});

opg('#mediaFormat').listBox({
	api: opg.api.mediaTypes ,
	value : 'movieType',
	onAjaxEnd: data=> {
		let arr = data ;
		data = {
			results : arr
		} ;
	}
});
opg('#interfaceVersion').listBox({
	api: opg.api.interfaceVersions,
	onAjaxEnd: data=> {
		let arr = [];
		for(let key in data){
			arr.push({
				id : key ,
				name : data[key]
			});
		}
		data.results = arr;
	}
});

let tree2 = opg('<div id="tree2"></div>').tree({
	api: opg.api.orgTree,
	onAjaxEnd: (data)=> {
		data.results = data.root.children;
	},
	text: 'name',
	value: 'id',
	combo: {
		allowBlank: true,
		closeOnClick: true,
		textField: '#org',
		valueField: '#orgId',
	}
});

//Add new
$('#btnAdd').click(function () {

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg.confirm(`<iframe src="${infoPage}" />`, function (i, ifr, v) {
		//debugger;
		//console.log(i , ifr , v);
		return ifr.doSave(pop, tb);
	}, {
		title: '新增渠道',
		btnMax: true,
		width: 720,
		height: 500,
		buttons: {
			ok: '保存新增渠道',
			cancel: '取消'
		}
	});

	//console.log(pop);
});

let tb = opg('#tb').table({
	columns: [
		{
			text: '渠道名称', width: 100,
			src: 'name'
		},
		{
			text: '渠道编码', width: 80,
			src: 'code'
		},
		{
			text: '业务',
			src: 'busiCodes',
			render: v => v.join(', ')
		},
		{
			text: '标准节目下发媒体类型', width: 180,
			src: 'mediaFormat',
			render: v => v.join(', ')
		},
		{
			text: '图片类型', width: 180,
			src: 'pictureFormat',
			render: v => v.join(', ')
		},
		{
			text: '接口版本', width: 76,
			src: 'interfaceVersion'
		},
		{
			text: '所属组织', width: 100,
			src: 'orgName'
		},
		{
			src: 'id', text: '操作', width: 180,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">修改</button> 
						<button class="btn-mini btn-danger" data-id="${val}" data-title="${row.name}">删除</button>
						<button class="btn-mini btn-switch btn-${row.status==1?'success':'warning'}" data-id="${val}" data-title="${row.name}">${row.status==1?'恢复分发':'暂停分发'}</button>
						`
			}
		}
	],
	api: opg.api.station,
	//lazy: true,
	pagination: {
		pageSize: 10
	}
});


//edit
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	//noinspection TypeScriptUnresolvedVariable
	let pop = top.opg.confirm(`<iframe src="${infoPage}?id=${id}" />`, function (i, ifr) {
		return ifr.doSave(pop, tb);
	}, {
		title: `修改渠道: ${title}`,
		btnMax: true,
		width: 720,
		height: 500,
		buttons: {
			ok: '保存修改',
			cancel: '取消'
		}
	});
});


//del
tb.tbody.on('click', '.btn-danger', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.danger(`要删除“<b>${title}</b>”吗？`, function () {
		opg.api.delete({id: id}, ()=>tb.update());
	}, {
		title: '请确认'
	});
});

//pause
tb.tbody.on('click', '.btn-switch', function () {
	let btn = $(this), id = btn.data('id');
	opg.api.switch({id: id}, ()=>tb.update());
});