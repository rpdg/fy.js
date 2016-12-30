import ops from 'ts/ops.ts';


let checkedInfo = parent.window['checkedInfo'];
let checkedCategory = checkedInfo.category , checkedCategoryHash = ops.convert.arrayToHash(checkedCategory , 'id') ;
console.log(checkedCategoryHash);


ops.api({
	roles: 'system/role/list',
});


let data = [
	{
		id : 1 ,  name: 'aaa' , type : 0, children: [
			{
				id : 11 ,  name: 'aaa-1' , type : 1
			}
		]
	},
	{
		id : 2 ,  name: 'bbb' , type : 0, children: [
			{
				id : 21 ,  name: 'bb-1' , type : 0, children: [
					{
						id : 211 ,  name: 'bb-1' , type : 1
					},
				]
			},
			{
				id : 22 ,  name: 'bb-2' , type : 0
			},
		]
	},
];

let tree = ops('#tree').tree({
	data: data ,
	root: '站点分类' ,
	name : 'categoryTree' ,
	template : '<label>${id:=mkChk} ${name}</label>' ,
	render : {
		mkChk : (id , i , row)=>{
			let html = '';
			if(row.type == 1){
				let chked = (id in checkedCategoryHash)? 'checked': '';
				html += `<input type="checkbox" name="chkCategory" value="${id}" data-name="${row.name}" ${chked}>`;
			}
			return html ;
		}
	}
});




window['clearSelectedData'] = function () {
	checkedCategory.length = 0 ;
	$(':checkbox:checked[name=chkCategory]').prop('checked' , false);
};

window['getSelectedData'] = function () {
	let arr = [] , chk = $(':checkbox:checked[name=chkCategory]');
	chk.each((i , elem)=>{
		let $e = $(elem);
		arr.push({
			id : $e.val(),
			name : $e.data('name'),
		});
	});
	checkedCategory = arr ;

	return checkedCategory;
};