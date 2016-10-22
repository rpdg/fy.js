import {AjaxDisplayObject} from './DisplayOject';

function searchData(data, id) {
	var v;
	for (let i = 0, l = data.length; i < l; i++) {
		let obj = data[i];
		if (obj.id == id) {
			v = obj;
			break;
		}
		else if (obj.children) {
			v = searchData(obj.children, id);
			if (v) {
				break;
			}
		}
	}

	return v;
}

class Tree extends AjaxDisplayObject {

	selectedItemId: number;
	prevItemId: number;
	template: string;
	cmd ?: string;
	root ?: JQuery;
	currentLi ?: JQuery;
	prevLi ?: JQuery;

	constructor(jq: JQuery, cfg: any) {
		var template;

		if (cfg.cmd === 'checkAll') {
			template = '<label><input type="checkbox" value="${id}"> ${name}</label>';
		}
		else {
			template = '${name}';
		}
		cfg = $.extend({
			template: template
		}, cfg);

		super(jq, cfg);
	}

	init(jq: JQuery, cfg: any) {
		super.init(jq, cfg);


		var self = this;

		this.cmd = cfg.cmd;

		if (cfg.root) {
			this.root = $('<ul></ul>');

			var node = $(`<ul class="filetree treeview"><li class="last">
							<span class="sp folder">${cfg.root}</span>
						</li></ul>`);
			node.find('li').append(this.root);
			node.appendTo(this.jq);
		}
		else {
			this.root = $('<ul class="filetree treeview"></ul>');
			this.jq.append(this.root);
		}

		this.selectedItemId = -1;
		//this.currentData = null;
		this.currentLi = null;

		this.template = '<li id="tree' + this.guid + 'Li_${id}" class="${id:=getLiClass}">${id:=getDiv}<span id="tree' + this.guid + 'Sp_${id}" data-id="${id}" class="sp ${id:=getSpClass}">' + cfg.template + '</span>${id:=getUl}</li>';

		//this.render = {};

		this.root.on('click', '.hitarea', function (e) {

			e.stopImmediatePropagation();
			//
			//

			var $div = $(this);
			$div.toggleClass('collapsable-hitarea expandable-hitarea').siblings('ul').toggle();

			var $li = $div.parent();
			$li.toggleClass('collapsable expandable');

			if (this.className.indexOf('last') > -1) {
				$div.toggleClass('lastCollapsable-hitarea lastExpandable-hitarea');
				$li.toggleClass('lastExpandable lastCollapsable');
			}
		});


		this.jq.on('click', '.sp', function (e) {
			var sp = $(this);

			if (self.selectedItemId != sp.data('id')) {

				self.prevItemId = self.selectedItemId;
				self.prevLi = self.currentLi;

				self.selectedItemId = sp.data('id');
				self.currentLi = sp.closest('li');

				if (self.prevLi)
					self.prevLi.find('.sp').removeClass('selected');

				sp.addClass('selected');

			}

		});

	}

	getSelectedData() {
		//console.log(this.data , this.selectedItemId);
		return searchData(this.data, this.selectedItemId);
	}

	bindData(data: any) {

		var json = data, list;

		if ($.isArray(data)) {
			list = data;
		}
		else {
			list = data[this.arrSrc];
		}


		this.add(list);


		this.prevItemId = this.selectedItemId;
		this.selectedItemId = -1;
		this.prevLi = this.currentLi;
		this.currentLi = null;

		this.data = list;

		this.bindHandler(json);


	}


	add(data, parent?: any) {

		var self = this, parentUl;

		if (!parent) {
			parentUl = this.root;
		}
		else {
			parentUl = $('#tree' + self.guid + 'Ul_' + parent.id);
		}


		parentUl.bindList({
			list: data,
			template: self.template,
			itemRender: {
				getDiv: (id, i, row)=> {
					if (row.children || row.hasChildren) {
						var cls = 'hitarea collapsable-hitarea';
						if ((i + 1) === data.length)
							cls += ' lastCollapsable-hitarea';
						return '<div class="' + cls + '"></div>';
					}
					return '';
				},
				getUl: (id, i, row)=> {
					if (row.children || row.hasChildren) {
						return `<ul id="tree` + self.guid + `Ul_${id}"></ul>`;
					}
					return '';
				},
				getLiClass: (id, i, row)=> {
					var cls = '';
					if (row.children || row.hasChildren) {
						cls = 'collapsable';

						if ((i + 1) === data.length)
							cls += ' lastCollapsable';
					}
					else {
						if ((i + 1) === data.length)
							cls = 'last';
					}

					return cls;
				},
				getSpClass: (id, i, row)=> {
					return (row.children || row.hasChildren) ? 'folder' : 'file';
				}
			},
			mode: (parent ? 'append' : 'html')
		});

		for (let i = 0, l = data.length; i < l; i++) {
			let node = data[i];
			if (node.children) {
				this.add(node.children, node);
			}
		}


		if (this.cmd === 'checkAll') {
			parentUl.find('.folder').each(function (x, span) {
				let sp = $(span), ul = sp.siblings('ul');
				sp.find(':checkbox').syncCheckBoxGroup(':checkbox', ul);
			});
		}
	}

	findObjectById(id) {
		return searchData(this.data, id);
	}
}


export default Tree;