

;
(function (window, $, fy) {

	//Ajax Form
	/* 	form */
	var FromClass = function (jq, sets) {
		//初始化默认参数
		var cfg = $.extend({}, sets);

		//call super constructor
		FromClass.parent.call(this , jq , cfg) ;

		//定义属性
		//public
		if (this.jq[0].tagName !== "FORM") {
			var tmp = this.jq.children().first();
			if (tmp[0].tagName !== "FORM")
				this.jq = this.jq.wrapInner($("<form style='padding:0;margin:0;'></form>")).children().first();
			else
				this.jq = tmp ;
		}

		this.action = cfg.action ;
		this.method = (cfg.method === "post" ? "post" : (cfg.method === "get" ? "get" : "getJSON")) ;

		this.validator = cfg.validator ;
		this.success = cfg.success ;

		//private
		this.param = null ;
		this.oldData = cfg.data ;

		//Events

		//
		if(!this.lazy) this.create();

		if(cfg.trigger) {
			var that = this;
			this.trigger = $(cfg.trigger).click(function(){
				that.submit();
			});
		}
	} ;

	FromClass.prototype = {
		create : function() {
			if (typeof this.onInit === 'function') this.onInit() ;

			this.jq[0].onsubmit = fy.PREVENT_FN ;

			if (this.data) this.bindData({data : this.data} , true) ;
			else if (this.url) {
				this.xhr = $.ajaxSettings.xhr() ;
				this.ajax(this.param , true) ;
			}
			else this.data = this.jq.fieldsToJson() ;

			return this ;
		} ,
		bindData: function (json , isInCreating) {

			this.oldData = this.data ;
			this.data = json.data ;

			this.jq.jsonToFields(json.data) ;

			this.bindHandler(json , isInCreating);

			if (isInCreating) this.createHandler(json) ;
			else this.updateHandler(json) ;
			return this;
		} ,
		toJSON :  function() {
			return this.jq.fieldsToJson() ;
		} ,
		submit:function (outParam) {

			var value = outParam ? $.extend({} , this.data , outParam) : this.toJSON() ;

			var sendData = this.validateHanler(value) ;

			if(sendData){
				if (this.action) {
					if(this.trigger) this.trigger.prop("disabled" , true) ;
					if(sendData === true) sendData = value ;
					var that = this ;

					$.ajax({
						url : this.action ,
						dataType : "json",
						data : sendData ,
						type : this.method ,
						success: function (json, textStatus, jqXHR) {
							if(json.error){
								if(that.action.handleError)
									that.action.handleError.call(that.action , json.error) ;
								else fy.onAjaxError(json.error);
							}
							else {
								that.oldData = value ;
								if (typeof that.success === 'function') that.success.call(that, value, json);
							}
						} ,
						complete : function(jqXHR , textStatus){
							if(that.trigger) that.trigger.prop("disabled" , false) ;
						}
					});

				}
				else {
					this.oldData = value ;
					if (typeof this.success === 'function') this.success(value);
				}
			}

			return this;
		},
		ajaxEndHandler : function(json , isInCreating){
			if(typeof this.onAjaxEnd === 'function') this.onAjaxEnd(json , isInCreating) ;
		} ,
		reset : function (){
			this.jq.jsonToFields(this.oldData);
			return this ;
		} ,
		clear:function (){
			this.jq.reset();
			return this ;
		} ,
		validateHanler : function (param) {
			var v = true ;
			if(typeof this.validator === 'function') v = this.validator(param);
			return v ;
		}
	} ;
	fy.register("form", FromClass , "AjaxDisplayObject");

})(window, jQuery, fy);


