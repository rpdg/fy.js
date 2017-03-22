import opg from 'ts/opg.ts';
import {store, Cache} from "ts/util/store";
import {MediaInfo} from '../@comm/info_mediaViewer' ;


opg.api({
	meta: 'audit/viewMeta/${assetId}',
	pics: 'audit/viewPics/${assetId}',
	contentUsages: 'base/contentUsages', //用途
	copyRightTypes: 'base/copyRightTypes', //版权类型
	priceTypes: 'base/priceTypes', //资费类型
	serialSourceTypes: 'base/serialSourceTypes', //节目源类型
	starLevels: 'base/programStarLevels', //推荐级别
	ratings: 'base/programRatings', //限制级别
	region: 'admin/content/region/queryAll', //地域
	company: 'admin/content/company/queryAll', //版权内容提供商
	languages: 'base/languages', //语言
	mediaAuditStatus: 'base/mediaAuditStatus', //获取审核状态枚举
	auditMedias: 'audit/auditMedias', //获取媒体文件
	'auditFile!PUT': 'audit/auditFile/${fileId}', //更改媒体文件审核状态
});


let currentUser = store.get('userInfo');
let cache = Cache.getInstance(), orderRow = cache.get('currentRow'), mediaRow;
const assetId = opg.request['assetId'], orderId = orderRow['orderId'];


opg('#mainTab').tabView({
	data: [
		{label: '媒体文件', view: '#d0'},
		{label: '元数据', view: '#d1'},
		{label: '图片文件', view: '#d2'},
	]
});

let contentUsages, copyRightTypes, priceTypes, serialSourceTypes, starLevels, ratings, mediaAuditStatus;

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
	opg.api.mediaAuditStatus((data) => {
		mediaAuditStatus = data;
	}),
).then(() => {
	//媒体文件
	opg.api.auditMedias({assetId, orderId}, (data) => {
		let arr = data.amsMediaFiles;
		if (arr && arr.length)
			mediaRow = arr[0];
		else
			return;

		//
		let comment: any;
		try {
			comment = JSON.parse(data.comment);
		}
		catch (e) {
			comment = [];
		}

		let mediaInfo: MediaInfo = {
			fileId: mediaRow.id,
			filePath: mediaRow.workPath,
			commentArray: comment,
			orderId: orderId,
			writable: false,
		};


		//媒体文件表
		let tbMedia = opg('#tbVideo').table({
			data: arr,
			columns: [
				{
					text: '生产库',
					src: 'workPath'
				},
				{
					text: '审核状态',
					src: 'auditStatus',
					width: 150,
					render: (val) => {
						return mediaAuditStatus[val];
					}
				},
				{
					text: '操作',
					src: 'workStatus',
					width: 150,
					render: (workStatus, i, row) => {
						if (workStatus == 3) {
							if (!orderRow.executor || (orderRow.executor == currentUser.loginName)) {
								mediaInfo.writable = true;
								return `<button class="btnAudit btn-mini btn-warning" data-flid="${row.id}" data-ordid="${orderId}">审片</button>`;
							}
							else {
								mediaInfo.writable = false;
								return `<button class="btnView btn-mini btn-info" data-flid="${row.id}" data-ordid="${orderId}">查看</button>`;
							}
						}
						return '';
					}
				},
			]
		});

		//审片（4审）
		tbMedia.tbody.on('click', '.btnAudit, .btnView', () => {
			opg.dispatch('MediaInfoLoaded', mediaInfo);

			if (mediaInfo.writable) {
				opg.api.auditFile({fileId: mediaInfo.fileId}, () => {
					//todo: 状态切换有多种情况，目前就只做 待审核 & 审核中 切换
					mediaRow.auditStatus = 1;
					tbMedia.update();
				});
			}
		});

	});

	//元数据
	opg.api.meta({assetId}, (data) => {

		data.length = opg.format.timeLength(data.length);
		data.vodArrange = contentUsages[data.vodArrange] || '';
		data.copyrightType = copyRightTypes[data.copyrightType] || '';
		data.defaultPriceType = priceTypes[data.defaultPriceType] || '';
		data.sourceType = serialSourceTypes[data.sourceType] || '';
		data.starLevel = starLevels[data.starLevel] || '';
		data.rating = ratings[data.rating] || '';

		if (data.originDate) data.originDate = data.originDate.split(' ')[0];

		for (let attr in data) {
			$(document.getElementById(attr)).text(`${data[attr]}`);
		}
		//todo:可能会有扩展类别
		if (data.type != 1000) {
			$('.forOne').find('*').css('visibility', 'visible');
		}
		else {
			$('.forOne').find('*').css('visibility', 'hidden');
		}
	});
});

//内容显示行
opg('#tbMeta').table({
	data: [orderRow],
	columns: [
		{
			text: '内容名称',
			src: 'managerName'
		},
		{
			text: '内容类型',
			src: 'ctype',
			width: 150,
		},
		{
			text: '生产类型',
			src: 'type',
			width: 100,
		},
		{
			text: '生产业务',
			src: 'busiCode',
			width: 100,
		},
		{
			text: '创建时间',
			width: 180,
			src: 'createTime'
		},
		{
			text: '发起人',
			src: 'creator',
			width: 100,
		},
	]
});

//图片
opg.api.pics({assetId}, function (data) {
	for (let key in data) {
		let img = document.getElementById(`img_${key}`) as HTMLImageElement ;
		if(img)
			img.src = `${data[key]['path']}?${Math.random()}`;
	}
});
