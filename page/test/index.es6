import {ops, $} from '../../es6/ops.es6'


//console.log(ops.string.padLeft('ss', 5, '0') , ops.request['a'] );


ops.api({
	'a1': 'a1.json',
	'table': 'tb.json'
});


/*ops.api.a1.set('onError' , function (err) {
 alert('echo: ' + err) ;
 });*/

/*ops.api.a1({a : 1} , (json) =>	{
 console.log(json);
 alert(1)
 } ) ;*/


window.lb = ops('#test1').radioBox({
	api: ops.api.a1,
	//data :[{t:11 , v:22} , {t:33,v:44}] ,
	text: 't',
	value: 'v',
	selectedIndex: 1,
	lazy: true,
	onCreate: function (json) {
		console.log('create:', json);
		//this.setSelectedIndex([0,1,2]);
	},
	onUpdate: function (json) {
		console.log('update:', json);
	},
	onSelect: function () {
		console.log('select:', this.getSelectedData());
	}
});


lb.update({a: 1});


//console.log(ba , $({}));


window.tvb = ops('#test3').table({
	columns: [
		{
			src: 'id', cmd: 'checkAll',
			render: function (val, i, row, name) {
				//console.log(val , i , row , name);
				return `bb + ${val}`;
			}
		},
		{
			src: 'id', text: 'ID', width: 60,
			render: function (val, i, row, name) {
				return `<b class="ico-expandable ellipse" data-esd="` + ops.guid() + `"></b> ${val}`;
			}
		},
		{src: 'text', text: '文本', align: 'left', width: 160},
		{
			src: 'text', text: 'xx文本', align: 'left',
			render: function (val, i, row, name) {
				//console.log(val , i , row , name);
				return `bb + ${val}`;
			}
		}
	],
	//api: ops.api.table,
	lazy: true,
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

$('#btnUpdate').click(function () {
	tvb.update([{id: 111 , text : 'haha'}]);
});

tvb.tbody.on('click', '.ico-expandable', function (e) {

	var cur = $(this), esd = cur.data('esd');
	var tr = $(this).parents('tr');

	if (cur.hasClass('ellipse')) {

		ops.api.table({id: esd}, function (json) {
			var th = $('<tr class="subTHead esd_' + esd + '"><th></th><th colspan="2">发起时间</th><th>状态</th></tr>').insertAfter(tr);

			th.bindList({
				list: json.data,
				template: '<tr class="subTBody esd_' + esd + '"><td></td><td colspan="2">${id}</td><td>${text}</td></tr>',
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

//console.log(tvb);
$('#btnAlert').click(function () {
	/*ops('#sdsd').popup({
	 title: '标题',
	 btnClose: true
	 });*/
	ops.alert(ops.guid());
});

$('#btnIframeTop').click(function () {
	var pop = ops.popTop($('<iframe src="pop/i.html" />'), {
		title: '修改密码',
		btnMax: true,
		buttons: {
			ok: 'OK2',
			cancel: 'Cancel'
		},
		callback: function (i, iframe) {
			if (i === 0) {
				iframe.closeHandler(pop);
				return true;
			}
			//console.log(b);
		}
	});
});

$('#btnIframe').click(function () {

	var pop = ops('<iframe src="pop/i.html" />').popup({
		modal: true,
		width: 600,
		height: 500,
		show: true,
		destroy: false,
		buttons: {
			ok: 'OK2',
			cancel: 'Cancel'
		},
		callback: function (i, ev, iframe) {
			if (i === 0) {
				iframe.fn(pop);
				return true;
			}
		}
	});
	pop.max();


	/*var b = ops.alert('<iframe src="i.html" />', function (i , ev , iframe) {
	 if (i === 0) {
	 iframe.fn(b);
	 }
	 //console.log(b);
	 return true;
	 }, {
	 width: 800,
	 height: 400,
	 title: 'xx',
	 btnMax: true
	 });*/


});


//console.log(pop);