;
(function (window, $, fy, undefined) {

	var TreeField = function(jq, cfg){
		var def = {
			name: cfg.name || fy.random() ,
			singleSelect : true ,
			value : 'id' ,
			textSrc : 'text',
			unique: true
		} ;

		this.onSelect = cfg.onSelect ;
		delete cfg.onSelect ;

		this.onCreate = cfg.onCreate ;
		delete cfg.onCreate ;

		var sets = $.extend(def, cfg ) , that = this ;
		this.name = sets.name ;
		this.singleSelect = sets.singleSelect ;

		if(!this.singleSelect){
			this.value = [] ;
		}

		var renderer = cfg.renderer? ':=render' : '' ;

		sets.template  = cfg.template || '<li><span><label><input name="'+ sets.name +'" type="' +
			(sets.singleSelect?'radio':'checkbox') +
			'" value="{'+ sets.value +	'}">{'+ sets.textSrc + renderer +'}</label></span></li>' ;

		//self attributes
		this.jq = jq.prop("readonly", true).addClass("treeField-input").css('user-select' , 'none') ;
		if(fy.browser.ie){
			this.jq[0].onselectstart = fy.PREVENT_FN ;
		}


		var treeSets = $.extend({} , sets) ;
		treeSets.onCreate = function(json){
			this.jq.delegate('input[name="'+sets.name+'"]' , 'click' , function(evt){
				that._syncData(evt);
			}) ;
			//call super constructor
			sets.target = this.jq ;
			sets.data = json.data ;
			TreeField.parent.call(that, jq, sets);
		} ;


		this.tree = fy($('<ul class="combo-dropDown treeField-combo" />').appendTo("body")).tree(treeSets) ;

	};

	TreeField.prototype = {
		_syncData : function(evt){
			if(this.singleSelect) {
				var $elem = $(evt.target) ;
				var val = $elem.val() ;
				if(this.value != val){
					this.value = val ;
					this.text = $elem.parent().text() ;
					this.jq.val(this.text) ;
				}
			}
			//TODO: 优化
			else{
				//树结构可能异步分次加载，所以每次都选择checkbox控件
				var checked = $('[name="'+this.name+'"]:checked') , that = this , txt=[] ;
				this.value.length = 0 ;
				checked.each(function(i,o){
					that.value[i] = o.value ;
					txt[i] = $(o).parent().text() ;
				});
				this.text = txt.join("; ") ;
				this.jq.val(this.text) ;
			}
			this.selectHandler(evt) ;
		} ,
		selectHandler: function(evt){
			if(this.onSelect) this.onSelect(evt) ;
		}
	};

	fy.register("treeField", TreeField, "ComboBase");
})(window, jQuery, fy);