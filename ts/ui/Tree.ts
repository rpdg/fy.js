import {AjaxDisplayObject} from './DisplayOject';
import {Combo, ICanPutIntoCombo} from './Combo'
import {LocalStore} from '../util/store';

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

	treeName :string;
	cache :boolean;
	selectedItemId: number;
	prevItemId: number;
	template: string;
	render : any ;
	cmd ?: string;
	root ?: JQuery;
	currentLi ?: JQuery;
	prevLi ?: JQuery;
	combo?: Combo;
	textSrc ?: string;
	valueSrc ?: string;

	private _cachedExpandedLeaf :any ;
	private _store :LocalStore ;

	constructor(jq: JQuery, cfg: any) {
		cfg = $.extend({
			text: 'name',
			value: 'id' ,
			cache : true
		}, cfg);

		super(jq, cfg);
	}

	/*set rootName(name: string) {
	 this.jq.find('folder:eq(0)').text(name);
	 }*/

	init(jq: JQuery, cfg: any) {

		super.init(jq, cfg);

		this.cache = cfg.cache ;
		this.treeName = cfg.name ;
		this._store =  new LocalStore(false) ;
		this._cachedExpandedLeaf =  {} ;

		if(!this.treeName){
			this.treeName = `${this.guid}`;
			if(this.cache)
				this.cache = false ;
		}
		this.treeName = `tree_${this.treeName}`;

		if(this.cache){
			this._cachedExpandedLeaf = this._store.get(this.treeName) || {} ;
		}

		console.log('aaa' , this._cachedExpandedLeaf);

		if (!cfg.template) {
			if (cfg.cmd === 'checkAll') {
				cfg.template = '<label><input id="' + this.treeName + 'Chk_${id}" type="checkbox" value="${' + cfg.value + '}"> ${' + cfg.text + '}</label>';
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
		this.render = cfg.render;
		this.template = '<li id="' + this.treeName + 'Li_${id}" class="${id:=_getLiClass}" data-id="${id}">${id:=_getDiv}<span id="' + this.treeName + 'Sp_${id}" data-id="${id}" class="sp ${id:=_getSpClass}">' + cfg.template + '</span>${id:=_getUl}</li>';

		//this.render = {};

		this.root.on('click', '.hitarea', function (e) {

			e.stopImmediatePropagation();
			//
			//

			let $div = $(this);
			$div.toggleClass('collapsable-hitarea expandable-hitarea').siblings('ul').toggle();

			let $li = $div.parent() , leafId = $li.data('id');
			$li.toggleClass('collapsable expandable');

			if(self.cache){
				if(leafId in self._cachedExpandedLeaf){
					delete self._cachedExpandedLeaf[leafId];
				}
				else{
					self._cachedExpandedLeaf[leafId] = 1;
				}
				self._store.set(self.treeName , self._cachedExpandedLeaf);
			}


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
		console.warn(self._cachedExpandedLeaf);

		if (!parent) {
			parentUl = this.root;
		}
		else {
			parentUl = $('#' + self.treeName + 'Ul_' + parent.id);
		}

		let renders = {
			_getDiv: (id, i, row)=> {
				if (row.children || row.hasChildren) {
					let cls ;
					if(id in self._cachedExpandedLeaf){
						cls = 'hitarea collapsable-hitarea';
						if ((i + 1) === data.length)
							cls += ' lastCollapsable-hitarea';
					}
					else{
						cls = 'hitarea expandable-hitarea';
						if ((i + 1) === data.length)
							cls += ' lastExpandable-hitarea';
					}

					return '<div class="' + cls + '"></div>';
				}
				return '';
			},
			_getUl: (id, i, row)=> {
				if (row.children || row.hasChildren) {
					let style = (id in self._cachedExpandedLeaf) ? '': ' style="display: none;"';
					return `<ul id="` + self.treeName + `Ul_${id}" ${style}></ul>`;
				}
				return '';
			},
			_getLiClass: (id, i, row)=> {

				let cls = '';
				if (row.children || row.hasChildren) {
					if(id in self._cachedExpandedLeaf){
						cls = 'collapsable';

						if ((i + 1) === data.length)
							cls += ' lastCollapsable';
					}
					else{
						cls = 'expandable';

						if ((i + 1) === data.length)
							cls += ' lastExpandable';
					}
				}
				else {
					if ((i + 1) === data.length)
						cls = 'last';
				}

				return cls;
			},
			_getSpClass: (id, i, row)=> {
				return (row.children || row.hasChildren) ? 'folder' : 'file';
			}
		};

		if(self.render){
			for(let ky in self.render){
				if(!(ky in renders)){
					renders[ky] = self.render[ky] ;
				}
			}
		}

		parentUl.bindList({
			list: data,
			template: self.template,
			itemRender: renders,
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