import opg from 'ts/opg' ;

opg.api({

});

class ViewCopyright {
	constructor(row){
		let html:string ;
		if(row){
			html = `
					<table class="search-table">
						<tr><td colspan="4" class="lead text-center">关联版权内容</td></tr>
						<tr>
							<td class="lead">版权内容名称</td><td style="width: 40%;">znytest1 </td>
							<td class="lead">版权内容别名</td><td>ccc</td>
						</tr>
					</table>
					<table class="search-table">
						<thead>
						<tr>
							<td class="lead text-center" style="width: 160px;">版权类型</td><td class="lead text-center" style="width: 120px;">版权开始时间</td>
							<td class="lead text-center" style="width: 120px;">版权结束时间</td><td class="lead text-center" style="width: 120px;">使用期限(天)</td>
							<td class="lead text-center">授权平台</td>
						</tr>
						</thead>
						<tbody>
						<tr>
							<td class="text-center">版权内容名称</td><td class="text-center">znytest1 </td>
							<td class="text-center">版权内容别名</td><td class="text-center">ccc</td>
							<td class="text-center">ccc</td>
						</tr>
						</tbody>
					</table>
				`;
		}
		else{
			html = `
					<table class="search-table">
						<tr><td colspan="4" class="lead text-center">没有关联版权</td></tr>
					</table>
					`;
		}
		$('#d4').html(html);
	}
}

export default ViewCopyright;