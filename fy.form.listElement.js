;(function (window, $, fy) {
	var idSeed = 0 ;


	/*  listBox  , extends: ListBase

	 @param text：选项的文字关联的字段, 默认 "text"
	 @param value: 选项的值关联的字段, 默认 "value"
	 @param elementName: 如果从空容器动态生成select的话，需要指定的表单控件 name

	 */

	var ListBox = function(jq , sets) {
		//initialize defaults
		var tmpl = '<option value="{'+(sets.value||'value')+'}">{'+ (sets.text||'text') +'}</option>' ,
			cfg = $.extend({
				template: tmpl ,
				elementName : ('fyElem_'+(++idSeed))
			} , sets) ,
			that = this ;

		//call super constructor
		ListBox.parent.call(this , jq , cfg) ;

		this.elementName = cfg.elementName ;
		this.initSelectedIndex = cfg.selectedIndex || 0 ;
		this.autoFire = cfg.autoFire ;

		//如果是从空容器创建的，将jq对象指定到select控件上
		if (this.jq[0].tagName !== 'SELECT') {
			this.jq = $('<select name="'+ this.elementName +'" class="fui-button theme-select"></select>').appendTo(this.jq);
		}

		//this.jq.wrap('<span class="spFormElementWrap"/>') ;

		//add event listener
		this.jq.bind("change.fy" , function(evt) {
			that.selectHandler(evt) ;
		} );


		if(!this.lazy) this.create();

	} ;
	//methods
	ListBox.prototype = {
		setSelectedIndex : function(i) {
			//var s = this.selectedIndex ;
			this.selectedIndex = this.jq[0].selectedIndex = i ;
			/*if(s === -1){
				//trigger the onSelect evt
				//不能用自己触发，会有时序错误
				this.jq.trigger("change.fy") ;
			}*/
			return this ;
		} ,
		selectHandler : function(evt) {
			this.prevIndex = this.selectedIndex ;
			this.selectedIndex = this.jq[0].selectedIndex ;

			if (typeof this.onSelect === 'function') this.onSelect(evt) ;
		} ,
		bindHandler : function(json , isInCreating) {
			this.items = this.jq.find("option") ;

			this.selectedIndex = (this.items.length > this.initSelectedIndex) ? this.initSelectedIndex : (this.items.length?0:-1) ;
			this.prevIndex = -1 ;

			if (typeof this.onBind === 'function') this.onBind(json , isInCreating) ;

			if(this.selectedIndex > -1 || this.autoFire){
				var that = this ;
				setTimeout(function(){
					if(that.selectedIndex > 0) that.setSelectedIndex(that.selectedIndex) ;
					if(that.autoFire) that.jq.trigger("change.fy") ;
				} , 0) ;
			}
		},
		getValue : function(){
			return this.jq.val() ;
		} ,
		getText : function(){
			var jp = this.jq[0] ;
			if(jp.options.length) return jp.options[jp.selectedIndex].text ;
			return null;
		}
	};

	//regist into fy namespace 
	fy.register("listBox" , ListBox , "ListBase");





/* checkBox  , extends: ListBase
	应当放入某个外围容器中, 以 fy("#容器id") 来调用
	 @param text：选项的文字关联的字段, 默认 "text"
	 @param value: 选项的值关联的字段, 默认 "value"
	 @param elementName: 如果从空容器动态生成select的话，需要指定的表单控件 name
*/
	var CheckBox = function(jq , sets) {
		this.elementName = sets.elementName||('fyElem_'+(++idSeed)) ;

		//initilize defaults
		var tmpl = '<label><input name="'
				+ this.elementName
				+'" type="checkbox" value="{'+(sets.value||'value')+'}">{'+(sets.text||'text')+'}</label>'+ (sets.joiner===undefined?' ':sets.joiner) ,
			cfg = $.extend({template: tmpl} , sets) ,
			that = this ;

		this.autoFire = !!cfg.autoFire ;

		//call super constructor
		CheckBox.parent.call(this , jq , cfg) ;

		//attributes

		//add event listener
		this.jq.bind("change.fy" ,  function(evt) {
			that.selectHandler(evt) ;
		});


		if(!this.lazy) this.create();

	} ;
	//methods
	CheckBox.prototype = {
		bindHandler : function(json , isInCreating) {
			this.items = this.jq.find("input[name='"+this.elementName+"']:checkbox") ;
			if (typeof this.onBind === 'function') this.onBind(json , isInCreating) ;
		} ,
		getSelectedIndices : function() {
			var s = this.items.filter(':checked') , arr=[] , items = this.items ;
			s.each(function(i, elem){
				arr.push(items.index(elem)) ;
			}) ;
			return arr ;
		},
		getSelectedItems: function() {
			return this.items.filter(':checked')  ;
		},
		getSelectedData : function(original) {
			var s = this.items.filter(':checked') , arr = [] , that = this ;
			s.each(function(i,o){
				var src = that.data[that.items.index(this)] , tar = {}  , key;
				for (key in src) if (key.indexOf(":") === -1) tar[key]=src[key] ;
				arr.push(tar) ;
			}) ;
			return arr ;
		},
		getValue : function(){
			var s = this.items.filter(':checked') ;
			if(s.length){
				var arr = [] ;
				s.each(function(i, o){
					arr.push(o.value) ;
				}) ;
				return arr ;
			}
			return null ;
		},
		getText : function(){
			var s = this.items.filter(':checked') ;
			if(s.length){
				var arr = [] ;
				s.each(function(i, o){
					arr.push($(o.parentNode).text()) ;
				}) ;
				return arr ;
			}
			return null ;
		}
	};

	//regist into fy namespace 
	fy.register("checkBox" , CheckBox , "ListBase");






/* radioBox  , extends: ListBase
	应当放入某个外围容器中, 以 fy("#容器id") 来调用
	 @param text：选项的文字关联的字段, 默认 "text"
	 @param value: 选项的值关联的字段, 默认 "value"
	 @param elementName: 如果从空容器动态生成select的话，需要指定的表单控件 name
*/

	var RadioBox = function(jq , sets) {
		//initialize defaults
		this.elementName = sets.elementName||('fyElem_'+(++idSeed)) ;
		var tmpl = '<label><input name="'+ this.elementName
				+'" type="radio" value="{'+(sets.value||'value')+'}">{'+(sets.text||'text')+'}</label>'+ (sets.joiner===undefined?' ':sets.joiner) ,

			cfg = $.extend({template: tmpl , selectedIndex:-1} , sets) ,
			that = this ;

		this.autoFire = !!cfg.autoFire ;
		this.initSelectedIndex = cfg.selectedIndex ;

		//call super constructor
		RadioBox.parent.call(this , jq , cfg) ;

		//attributes

		//add event listener
		this.jq.delegate(':radio' , "change.fy" ,  function(evt) {
			that.selectHandler(evt) ;
		});


		if(!this.lazy) this.create();

	} ;
	//methods
	RadioBox.prototype = {
		bindHandler : function(json , isInCreating) {
			this.items = this.jq.find("input[name='"+this.elementName+"']:radio") ;
			var initSelectedElem = this.items.filter(':checked') ;
			this.selectedIndex = initSelectedElem.length ? this.items.index(initSelectedElem[0]) :(this.items.length > this.initSelectedIndex) ? this.initSelectedIndex : (this.items.length ? 0 : -1 );
			this.prevIndex = -1;

			if (typeof this.onBind === 'function') this.onBind(json , isInCreating) ;

			if(this.autoFire){
				if(this.initSelectedIndex !== undefined && this.initSelectedIndex > -1) {
					var that = this ;
					setTimeout(function(){
						var i = that.initSelectedIndex === undefined ? 0 : that.initSelectedIndex ;
						that.setSelectedIndex(i) ;
						that.items.eq(i).prop('checked' , true).trigger("change.fy") ;
					} , 0) ;
				}

			}
		} ,
		getValue : function(){
			return this.items.filter(':checked').val() ;
		},
		getText : function(){
			var s = this.items.filter(':checked') ;
			if(s.length){
				return s.parent().text() ;
			}
			return null ;
		}
	};

	//regist into fy namespace 
	fy.register("radioBox" , RadioBox , "ListBase");

})(window, jQuery, fy);

