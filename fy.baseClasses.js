/* DisplayObject
 所有可视控件类的基类，不应在程序中显式创建此类的实例
 */
;
(function (window, $, fy, undefined) {
	var DisplayObject = function (jq, cfg) {
		this.jq = jq;
		this.data = cfg.data;
		//Events
		if(!this.onInit) this.onInit = cfg.onInit;
		if(!this.onCreate) this.onCreate = cfg.onCreate;
	};
	DisplayObject.prototype = {
		create:function () {
			if (typeof this.onInit === 'function') this.onInit();
			if (typeof this.htmlMashup === 'function') this.htmlMashup(true);
			this.createHandler(this.data);
			return this;
		},
		createHandler:function (value) {
			if (typeof this.onCreate === 'function') this.onCreate(value);
			return this;
		},
		toString:function () {
			return this.define;
		}
	};

	fy.register("DisplayObject", DisplayObject);

/* AjaxDisplayObject
	所有可异步载入数据的控件类的基类，不应在程序中显式创建此类的实例

	@param data : objective Array 手动设定 this.data
	@param url : 绑定服务端url
	@param xhr : xhr对象

	@method abortAjax : 中断正在进行的ajax

	@event onInit
	@event onCreate
	@event onAjaxStart
	@event onUpdate
	@event onError
*/
	var AjaxDisplayObject = function (jq , cfg){
		//定义属性
		this.jq = jq ;
		this.lazy = cfg.lazy ;
		this.data = cfg.data ;
		this.url = cfg.url ;
		this.param = cfg.param ;
		this.ajaxType = cfg.ajaxType || 'GET' ;
		this.xhr = null ;
		this.created = false ;

		//Events
		this.onAjaxStart = cfg.onAjaxStart ;
		this.onAjaxEnd = cfg.onAjaxEnd ;
		this.onInit = cfg.onInit ;
		this.onCreate = cfg.onCreate ;
		this.onUpdate = cfg.onUpdate ;
		this.onError = cfg.onError ;
	} ;

	//类方法
	AjaxDisplayObject.prototype = {
		create : function() {
			//if (typeof this.onInit === 'function') this.onInit() ;

			//if (typeof this.htmlMashup === 'function') this.htmlMashup(true);

			if (this.data) this.bindData(this , true);
			else if (this.url) {
				this.xhr = $.ajaxSettings.xhr() ;
				this.ajax(this.param , true) ;
			}

			return this ;
		} ,
		createHandler : function(json) {
			this.created = true ;
			if (typeof this.onCreate === 'function') this.onCreate(json) ;
			return this;
		} ,
		abort : function(){
			if(this.xhr && (this.xhr.readyState!=4 && this.xhr.readyState != 0)) this.xhr.abort();
			return this;
		} ,
		update: function(param , callbackOnce){
			var json ;
			if(typeof callbackOnce === 'function') this.onUpdateOnce = callbackOnce ;

			if(this.url) {
				if (typeof param === 'function')  this.onUpdateOnce = param ;
				else{
					if (this.param) $.extend(this.param , param) ;
					else this.param = param ;
				}
			}
			else json = param||this.data ;


			if(this.created){
				if(this.url) this.ajax(this.param , false) ;
				else this.bindData(json);
			}
			else {
				if(!this.url && json) this.data = json ;
				//
				this.create();
			}

			return this ;
		} ,
		updateHandler : function(json ,isInCreating) {
			if (typeof this.onUpdate === 'function') this.onUpdate(json ,isInCreating) ;
		} ,
		ajax : function(param , isInCreating) {
			var that = this;
			this.ajaxStartHandler(isInCreating);

			var state = this.xhr.readyState ;
			if( state!== 4 && state!==0) this.xhr.abort();

			$.ajax({
				url : this.url,
				dataType : "json",
				data : param ,
				type : this.ajaxType ,
				xhr: function () { return that.xhr; },
				success: function (json, textStatus, jqXHR) {
					if (json.error) that.errorHandler(json.error);
					else {
						that.ajaxEndHandler(json, isInCreating);
						that.bindData(json , isInCreating);
					}
				}
			});


			return this ;
		},
		ajaxStartHandler : function(isInCreating){
			if(typeof  this.onAjaxStart === 'function') this.onAjaxStart(isInCreating) ;
		} ,
		ajaxEndHandler : function(json , isInCreating){
			if(typeof this.onAjaxEnd === 'function') this.onAjaxEnd(json , isInCreating) ;
		} ,
		bindData : function(data , isInCreating) {
			throw new Error(this.define + "的数据绑定函数未实现") ;
			//if (isInCreating) this.createHandler(json) ;
			//else this.updateHandler(json , isInCreating);
		} ,
		errorHandler : function (err) {
			if (typeof this.onError === 'function') this.onError(err) ;
			else if (this.url.handleError) this.url.handleError.call(this.url , err) ;
			else if (typeof fy.onAjaxError === 'function') fy.onAjaxError.call(this , err) ;
		},
		toString : function (){ return this.define ; } 
	};


	//注册到fy
	fy.register("AjaxDisplayObject" , AjaxDisplayObject);




/**
 *
 * ListBase :  extends  AjaxDisplayObject
	所有列表控件类的基类，不应在程序中显式创建此类的实例

	@param template : 手动指定的数据绑定模板

	@event onInit :
	@event onCreate 
	@event onSelect 

	@method bindData
	@method update
	@method setSelectedIndex
	@method getSelectedItem
	@method toJSON
*/
;

	//类构造函数
	var ListBase = function (jq , sets){
		//初始化默认参数
		var cfg = $.extend({} , sets) ;

		//call super constructor
		ListBase.parent.call(this , jq , cfg) ;

		//定义属性
		//public
		this.data = cfg.data ;
		this.template = cfg.template ;
		this.items = null ;
		//private
		this.selectedIndex = -1;
		this.prevIndex = -1;
		this.bindOptions = this.getBindOptions(sets.bindOptions) ;

		//Events
		this.onSelect = cfg.onSelect ;
		this.onBind = cfg.onBind ;

		//过程
	} ;

	//类方法
	ListBase.prototype = {
		bindData : function(json , isInCreating) {

			this.json = json ? json : [] ;

			if($.isArray(json)){
				this.bindOptions.list = json ;
				this.json = {data : json} ;
			}
			else{
				this.bindOptions.list = json.data || [] ;
			}

			// 如果有过滤器，则需要
			// 将过滤后的array保存下，待稍后作为 this.data
			if(this.bindOptions.itemFilter) this.bindOptions.storeData = true ;

			this.jq.bindList(this.bindOptions) ;

			//this.data 是过滤后的数组
			if(this.bindOptions.itemFilter){
				this.data = this.jq.data('bound-array') ;
				this.jq.removeData('bound-array') ;
			}
			else this.data = this.bindOptions.list ;

			this.bindHandler(json , isInCreating);

			//invoke event function
			if (isInCreating) this.createHandler(json) ;
			else this.updateHandler(json) ;


			if (typeof this.onUpdateOnce === 'function') {
				this.onUpdateOnce(json ,isInCreating) ;
				delete this.onUpdateOnce ;
			}

			return this ;
		} ,

		bindHandler : function(json , isInCreating){
			if(!isInCreating){
				this.selectedIndex = -1;
				this.prevIndex = -1;
			}

			if (typeof this.onBind === 'function') this.onBind(json , isInCreating) ;
		} ,

		getBindOptions : function(obj) {
			var d = { template : this.template } ;
			return $.extend(d , obj) ;
		} ,
		setSelectedIndex : function(i) {
			//this.prevIndex = this.selectedIndex ;
			//this.selectedIndex = i ;
			var evt = {target : this.items.eq(i)[0]};
			this.selectHandler(evt) ;
			return this ;
		} ,
		selectHandler : function(evt) {
			//log(currIndex , prevIndex);
			//this.setSelectedIndex(currIndex) ;
			this.prevIndex = this.selectedIndex ;
			this.selectedIndex = this.items.index(evt.target) ;

			if (typeof this.onSelect === 'function') this.onSelect(evt) ;
		} ,
		getPureData: function(tar){
			if(tar &&  !(tar instanceof Array)) return null;
			var list = fy.deepClone( tar || this.data ) ;
			for(var i=0 , l = list.length ; i<l ; i++){
				var item = list[i] , key;
				for(key in item){
					if(key.indexOf(":") > -1) delete item[key] ;
				}
			}
			return list;
		} ,
		getSelectedData : function(original) {
			var src = this.data[this.selectedIndex] ;
			//过滤对象中的绑定时增加的属性
			if(!original){
				var tar = {}  , key;
				for (key in src) if (key.indexOf(":") === -1) tar[key]=src[key] ;
				return tar ;
			}
			else return src ;
		} ,
		getPrevData : function(original) {
			var src = this.data[this.prevIndex] ;
			//过滤对象中的绑定时增加的属性
			if(!original){
				var tar = {}  , key;
				for (key in src) if (key.indexOf(":") === -1) tar[key]=src[key] ;
				return tar ;
			}
			else return src ;
		} ,

		getSelectedItem : function () {
			return this.items[this.selectedIndex] ;
		} ,
		getPrevItem : function(){
			return this.items[this.prevIndex] ;
		} ,

		empty : function(){
			this.jq.html('');
			return this;
		},
		clearAll : function(){
			this.data = null ;
			return this.empty();
		}
	};


	//注册到fy
	fy.register("ListBase" , ListBase , "AjaxDisplayObject");

})(window, jQuery, fy);





