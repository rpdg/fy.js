import opg from 'ts/opg';
import {store, Cache} from "ts/util/store";
import ViewMedia from "./viewMedia";
import ViewMeta from "./viewMeta";
import ViewAudit from "./viewAudit";
import ViewCopyright from "./viewCopyright";

let cache = Cache.getInstance() ;

opg.api({
	pics: 'audit/viewPics/${assetId}',

	//信息
	'auditFile!PUT': 'audit/auditFile/${fileId}', //更改媒体文件审核状态
});


let currentUser = store.get('userInfo');
const currentRow = cache.get('currentRow');

console.log(currentRow , currentUser);
const id = opg.request['id'] ;


opg('#mainTab').tabView({
	data: [
		{label: '媒体文件', view: '#d0'},
		{label: '元数据', view: '#d1'},
		{label: '图片文件', view: '#d2'},
		{label: '审片意见', view: '#d3'},
		{label: '关联版权', view: '#d4'},
	]
});
/*.jq.append(`<div style="display: table-row; text-align: right; padding-top: 10px;">
				<div style="display: table-cell"></div>
				<button>buttons here</button>
			</div>`);*/

//媒体文件
new ViewMedia(currentRow) ;

//元数据
new ViewMeta(id, 'd1');


//图片
opg.api.pics({assetId: id}, function (data) {
	for (let key in data) {
		let img = document.getElementById(`img_${key}`) as HTMLImageElement ;
		if(img)
			img.src = `${data[key]['path']}?${Math.random()}`;
	}
});

//审片意见
new ViewAudit(currentRow);

//版权
new ViewCopyright(currentRow);