import {AjaxDisplayObject} from './DisplayOject';
import {Combo, ICanPutIntoCombo} from './Combo'


function searchData(data, id) {
	let v;
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

class Tree extends AjaxDisplayObject implements ICanPutIntoCombo {

	selectedItemId: number;
	prevItemId: number;
	template: string;
	cmd ?: string;
	root ?: JQuery;
	currentLi ?: JQuery;
	prevLi ?: JQuery;
	combo?: Combo;
	textSrc ?: string;
	valueSrc ?: string;

	constructor(jq: JQuery, cfg: any) {
		cfg = $.extend({
			text: 'name',
			value: 'id'
		}, cfg);

		super(jq, cfg);
	}

	/*set rootName(name: string) {
	 this.jq.find('folder:eq(0)').text(name);
	 }*/

	init(jq: JQuery, cfg: any) {

		super.init(jq, cfg);


		if (!cfg.template) {
			if (cfg.cmd === 'checkAll') {
				cfg.template = '<label><input id="tree' + this.guid + 'Chk_${id}" type="checkbox" value="${' + cfg.value + '}"> ${' + cfg.text + '}</label>';
			}
			else {
				cfg.template = '${' + cfg.text + '}';
			}
		}


		let self = this;

		this.cmd = cfg.cmd;

		if (cfg.root) {
			this.root = $('<ul></ul>');

			let node = $(`<ul class="filetree treeview rootUl"><li class="last rootLi">
							<span class="folder rootSp">${cfg.root}</span>
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

			let $div = $(this);
			$div.toggleClass('collapsable-hitarea expandable-hitarea').siblings('ul').toggle();

			let $li = $div.parent();
			$li.toggleClass('collapsable expandable');

			if (this.className.indexOf('last') > -1) {
				$div.toggleClass('lastCollapsable-hitarea lastExpandable-hitarea');
				$li.toggleClass('lastExpandable lastCollapsable');
			}
		});


		this.jq.on('click', '.sp', function (e) {
			let sp = $(this);

			if (self.selectedItemId != sp.data('id')) {

				self.prevItemId = self.selectedItemId;
				self.prevLi = self.currentLi;

				self.selectedItemId = sp.data('id');
				self.currentLi = sp.closest('li');

				if (self.prevLi)
					self.prevLi.find('.sp').removeClass('selected');

				sp.addClass('selected');

				if (typeof self.onSelect === 'function') self.onSelect(e);
			}

		});

		//combo
		if (cfg.combo) {
			let textField = $(cfg.combo.textField) ;
			textField.after(this.jq);

			this.combo = new Combo(textField,
				{
					allowBlank : cfg.combo.allowBlank,
					target: this.jq.addClass('treeField-combo'),
					valueField: cfg.combo.valueField,
				}
			);

			this.textSrc = cfg.text;
			this.valueSrc = cfg.value;

			this.jq.on('click', '.sp', ()=> {
				this.syncData(this.getSelectedData());
			});
			//
			if(cfg.combo.closeOnClick){
				this.jq.on('click', ()=>this.combo.close());
			}
		}

	}

	getSelectedData() {
		//console.log(this.data , this.selectedItemId);
		return searchData(this.data, this.selectedItemId);
	}

	bindData(data: any) {

		let json = data, list;

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

		let self = this, parentUl;

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
						let cls = 'hitarea collapsable-hitarea';
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
					let cls = '';
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
				sp.find(':checkbox').checkBoxAll(':checkbox', ul);
			});
		}
	}

	findObjectById(id) {
		return searchData(this.data, id);
	}


	syncData(data: any) {
		console.log(data);
		this.combo.setValue(data[this.textSrc], data[this.valueSrc]);
	}
}


export default Tree;