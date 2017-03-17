import opg from 'ts/opg.ts';

opg.api({
	metaInfo: 'audit/viewMeta/${assetId}',
	contentUsages: 'base/contentUsages', //用途
	copyRightTypes: 'base/copyRightTypes', //版权类型
	priceTypes: 'base/priceTypes', //资费类型
	serialSourceTypes: 'base/serialSourceTypes', //节目源类型
	starLevels: 'base/programStarLevels', //推荐级别
	ratings: 'base/programRatings', //限制级别
	region: 'admin/content/region/queryAll', //地域
	company: 'admin/content/company/queryAll', //版权内容提供商
	languages: 'base/languages', //语言
});

let contentUsages, copyRightTypes, priceTypes, serialSourceTypes, starLevels, ratings ;

class ViewMeta{
	constructor(assetId , containerId) {
		$.when(
			opg.api.contentUsages((data) => {
				contentUsages = data;
			}),
			opg.api.copyRightTypes((data) => {
				copyRightTypes = data;
			}),
			opg.api.priceTypes((data) => {
				priceTypes = data;
			}),
			opg.api.serialSourceTypes((data) => {
				serialSourceTypes = data;
			}),
			opg.api.starLevels((data) => {
				starLevels = data;
			}),
			opg.api.ratings((data) => {
				ratings = data;
			}),
		).then(() => {
			opg.api.metaInfo({assetId}, (data) => {

				data.length = opg.format.timeLength(data.length);
				data.vodArrange = contentUsages[data.vodArrange] || '';
				data.copyrightType = copyRightTypes[data.copyrightType] || '';
				data.defaultPriceType = priceTypes[data.defaultPriceType] || '';
				data.sourceType = serialSourceTypes[data.sourceType] || '';
				data.starLevel = starLevels[data.starLevel] || '';
				data.rating = ratings[data.rating] || '';
				if (data.originDate) data.originDate = data.originDate.split(' ')[0];

				let singleProgramClassName = 'forOne' ;
				//todo:可能会有扩展类别
				if (data.type != 1000) {
					singleProgramClassName = '';
				}

				let html = `
					<table class="search-table">
								<thead>
								<tr>
									<td colspan="4" class="lead text-center">基本信息</td>
								</tr>
								</thead>
								<tbody>
								<tr class="forSingleFileOnly">
									<td class="lead">节目名称</td>
									<td>${data.managerName||''}</td>
									<td class="lead">原名称</td>
									<td>${data.oriName||''}</td>
								</tr>
								<tr class="forSingleFileOnly">
									<td class="lead">索引名</td>
									<td>${data.sortName||''}<span id=""></span></td>
									<td class="lead">查询名</td>
									<td>${data.srarchName||''}</td>
								</tr>
								<tr>
									<td class="lead">节目类型</td>
									<td>${data.typeDesc||''}<span id=""></span></td>
									<td class="lead">类别</td>
									<td>${data.contentType||''}</td>
								</tr>
								<tr>
									<td class="lead">栏目Category</td>
									<td>${data.category||''}</td>
									<td class="lead ${singleProgramClassName}"><span>总集数</span></td>
									<td class="${singleProgramClassName}">${data.episodeNumber||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="genre">子类别Genre</label></td>
									<td colspan="3">${data.genre||''}</td>
								</tr>
								<tr>
									<td class="lead">标签Tag</td>
									<td colspan="3">${data.tags||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="categoryNames">分类</label></td>
									<td colspan="3">${data.categoryNames||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="groupNames">内容分组 </label></td>
									<td colspan="3">${data.groupNames||''}</td>
								</tr>
								<tr>
									<td class="lead">生效时间</td>
									<td>${data.validTime||''}</td>
									<td class="lead"><label for="expireTime">失效时间</label></td>
									<td>${data.expireTime||''}</td>
								</tr>
								<tr>
									<td class="lead">节目时长</td>
									<td colspan="3">${data.length||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="keyword">关键字</label></td>
									<td colspan="3">${data.keyword||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="description">简介</label></td>
									<td colspan="3">${data.description||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="adName">广告名称</label></td>
									<td colspan="3">${data.adName||''}</td>
								</tr>
								</tbody>
							</table>
					
							<table class="search-table">
								<thead>
								<tr>
									<td colspan="4" class="lead text-center">版权信息</td>
								</tr>
								</thead>
								<tbody>
								<tr>
									<td class="lead"><label for="vodArrange">用途</label></td>
									<td>${data.vodArrange||''}</td>
									<td class="lead"><label for="copyrightType">版权类型</label></td>
									<td>${data.copyrightType||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="copyrightValidTime">版权生效时间</label></td>
									<td>${data.copyrightValidTime||''}<span id=""></span></td>
									<td class="lead"><label for="copyrightExpireTime">版权失效时间</label></td>
									<td>${data.copyrightExpireTime||''}</td>
								</tr>
								</tbody>
							</table>
					
							<table class="search-table">
								<thead>
								<tr>
									<td colspan="4" class="lead text-center">详细信息</td>
								</tr>
								</thead>
								<tbody>
								<tr>
									<td class="lead"><label for="defaultPriceType">资费类型</label></td>
									<td>${data.defaultPriceType||''}<span id=""></span></td>
									<td class="lead"><label for="defaultPrice">默认资费 (元)</label></td>
									<td>${data.defaultPrice||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="newDay">新到天数</label></td>
									<td>${data.newDay||''}</td>
									<td class="lead"><label for="leftDay">剩余天数</label></td>
									<td>${data.leftDay||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="originDate">首播时间</label></td>
									<td>${data.originDate||''}</td>
									<td class="lead"><label for="issueYear">出品年代</label></td>
									<td>${data.issueYear||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="sourceType">节目源类型</label></td>
									<td colspan="3">${data.sourceType||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="starLevel">推荐级别</label></td>
									<td>${data.starLevel||''}</td>
									<td class="lead"><label for="rating">限制级别</label></td>
									<td>${data.rating||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="region">地域</label></td>
									<td>${data.region||''}</td>
									<td class="lead"><label for="company">版权内容提供商(出品公司)</label></td>
									<td>${data.company||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="language">语言</label></td>
									<td colspan="3">${data.language||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="actorDisplay">演员</label></td>
									<td colspan="3">${data.actorDisplay||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="writerDisplay">导演</label></td>
									<td colspan="3">${data.writerDisplay||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="awards">所获奖项</label></td>
									<td colspan="3">${data.awards||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="viewPoint">看点</label></td>
									<td colspan="3">${data.viewPoint||''}</td>
								</tr>
								<tr>
									<td class="lead"><label for="comments">备注</label></td>
									<td colspan="3">${data.comments||''}</td>
								</tr>
								</tbody>
							</table>
					`;

				$(`#${containerId}`).html(html);

			});
		});
	}
}

export default ViewMeta;