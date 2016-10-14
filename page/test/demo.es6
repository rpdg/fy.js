import {ops} from '/es6/ops';


ops.api({
	'a1': 'a1.json',
	'table': 'data/tb.json'
});


var tvb = ops('#test3').table({
	columns: [
		{
			src: 'id', cmd: 'checkAll',
			render: function (val, i, row, name) {
				//console.log(val , i , row , name);
				return `bb + ${val}`;
			}
		},
		{
			src: 'id', text: 'ID', width: 120,
			render: function (val, i, row, name) {
				return `<b class="ico-expandable ellipse" data-esd="` + ops.guid() + `"></b> ${val}`;
			}
		},
		{src: 'name', text: '标题', align: 'left', width: 220},
		{
			src: 'bizCode', text: '其他信息', align: 'left',
			render: function (val, i, row, name) {
				//console.log(val , i , row , name);
				return `bb + ${val}`;
			}
		},
		{
			src: 'id', text: '操作', width: 120,
			render: function (val, i, row) {
				return `<button class="btn-mini btn-info">查看</button> 
						<button class="btn-mini btn-danger" data-title="${row.text}">删除</button>`
			}
		}
	],
	api: ops.api.table,
	onSelect: function (evt) {
		//console.log(this);
	},
	pagination: {
		pageSize: 10,
		showCount: true,
		customizable: true
	},
	onCreate: function () {
		$('#btnGetTableValues').click(function () {
			console.log(tvb.getCheckData());
		});
	}
});
//expand
tvb.tbody.on('click', '.ico-expandable', function (e) {

	var cur = $(this), esd = cur.data('esd');
	var tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		ops.api.table({id: esd}, function (json) {
			var th = $('<tr class="subTHead esd_' + esd + '"><th></th><th colspan="2">发起时间</th><th colspan="2">状态</th></tr>').insertAfter(tr);

			th.bindList({
				list: json.data,
				template: '<tr class="subTBody esd_' + esd + '"><td></td><td colspan="2">${id}</td><td colspan="2">${text}</td></tr>',
				mode: 'after'
			});

			cur.toggleClass('ellipse expanded');
		})
	}
	else {
		cur.toggleClass('ellipse expanded');
		tr.nextAll('.esd_' + esd).remove();
	}


	//console.log(e , tr , tvb.cols);

	//tr.after;


});

//view
tvb.tbody.on('click', '.btn-info', function () {
	var pop = ops.popTop($('<iframe src="/page/test/pop/i.html" />'), {
		title: '查看',
		btnMax: true,
		width: 700,
		height: 500
	});
});
//del
tvb.tbody.on('click', '.btn-danger', function () {
	var btn = $(this), title = btn.data('title');
	ops.danger(`要删除“<b>${title}</b>”吗？`, function () {
		//ops.alert()
	}, {
		title: '请确认'
	});
});


$.getScript('/lib/jquery.datetimepicker.js', function () {

	var tbSearch = $('#tbSearch') ;

	var panel = ops.wrapPanel(tbSearch) ;

	panel.btnSearch.click(function () {
		var param = tbSearch.fieldsToJson() ;
		param.pageIndex = 0 ;
		tvb.update(param);
	});

	$('#time').datetimepicker({
		validateOnBlur: true
	});


});