import opg from 'ts/opg' ;

opg.api({
	'copyrights!!' : 'produce/asset/copyrights/${id}'
});

class ViewCopyright {
	constructor(row){
		opg.api.copyrights({id: row.id} , (data)=>{
			let html:string ;
			console.log('版权',data);
			if(data&& data.length){
				html = '' ;
				data.forEach((cp)=>{
					let program = cp.program||{} ;
					html += `
						<table class="search-table">
							<tr><td colspan="4" class="lead text-center">关联版权内容</td></tr>
							<tr>
								<td class="lead">版权内容名称</td><td style="width: 40%;">${program.name||''}</td>
								<td class="lead">版权内容别名</td><td>${program.alias||''}</td>
							</tr>
						</table>
						<table class="search-table">
							<thead>
							<tr>
								<td class="lead text-center" style="width: 180px;">版权类型</td><td class="lead text-center" style="width: 160px;">版权开始时间</td>
								<td class="lead text-center" style="width: 160px;">版权结束时间</td><td class="lead text-center" style="width: 120px;">使用期限(天)</td>
								<td class="lead text-center">授权平台</td>
							</tr>
							</thead>
							<tbody>
							<tr>
								<td class="text-center">${cp.copyrightTypeDesc||''}</td><td class="text-center">${cp.copyrightBeginDate?cp.copyrightBeginDate.split(' ')[0]:''}</td>
								<td class="text-center">${cp.copyrightEndDate?cp.copyrightEndDate.split(' ')[0]:''}</td><td class="text-center">${cp.lifetime||''}</td>
								<td class="text-center">${cp.authorizedPlatform||''}</td>
							</tr>
							</tbody>
						</table>
					`;
				})

			}
			else{
				html = `
					<table class="search-table">
						<tr><td colspan="4" class="lead text-center">没有关联版权</td></tr>
					</table>
				`;
			}
			$('#d4').html(html);
		});

	}
}

export default ViewCopyright;