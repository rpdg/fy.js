/**
 The progressBar control provides a visual representation of the progress of a task over time.

 */
;
(function (window, $, fy, undefined) {

	var progressBar = function (jq, cfg) {
		var def = {
				max : 100,
				value : 0 ,
				showLabel : false ,
				labelTemplate : "{percent}%" ,
				labelPlacement : "center",  //top,bottom,right,left
				width : 150 ,
				height: 10
			} ,
			sets = $.extend(def , cfg) ;

		//call super constructor
		progressBar.parent.call(this, jq, sets);

		//self attributes
		this.max = sets.max ;
		this.value = sets.value ;
		this.showLabel = sets.showLabel ;
		this.labelTemplate = sets.labelTemplate ;
		this.labelPlacement = sets.labelPlacement ;

		//self events
		//this.onShow = sets.onShow ;
		//this.onHide = sets.onHide ;
		this.onChange = sets.onChange ;
		this.onComplete = sets.onComplete ;

		this.create(sets);
	};

	progressBar.prototype = {
		create:function (sets) {
			if (typeof this.onInit === 'function') this.onInit();
			//
			var jq = this.jq ;
			if(sets.width && sets.height){jq.css({width:sets.width  ,  height:sets.height }) ;}
			else if(sets.width){jq.css("width" ,sets.width);}
			else if(sets.height){jq.css("height" ,sets.height);}

			this.barDiv = $('<div class="progressBar-value"></div>').appendTo(jq.addClass("progressBar")) ;
			if(this.showLabel) {
				this.msgdiv = $('<div class="progressBar-text"></div>').appendTo(jq) ;
				switch (this.labelPlacement){
					case "right":
						this.msgdiv.css({
							textAlign:"left" ,
							marginLeft : jq.outerWidth() ,
							marginTop : -(jq.outerHeight()+ parseInt(this.msgdiv.css("lineHeight") ,10))>>1
						}) ;
						break;
					case "left":
						this.msgdiv.css({
							textAlign:"right" ,
							marginLeft : -jq.outerWidth() ,
							marginTop : -(jq.outerHeight()+ parseInt(this.msgdiv.css("lineHeight") ,10))>>1
						}) ;
						break;
					case "top" :
						this.msgdiv.css({marginTop : -(jq.outerHeight()+ parseInt(this.msgdiv.css("lineHeight") ,10)) }) ;
						break;
					case "center" :
						this.msgdiv.css({marginTop : -(jq.outerHeight()+ parseInt(this.msgdiv.css("lineHeight") ,10))>>1 }) ;
						break ;
					case "bottom":
					default :
				}
			}
			this.setValue(sets.value) ;

			//
			this.createHandler();
			return this;
		},
		setValue : function(val){
			var obj ;
			if(typeof val === "number"){
				this.value = val ;
				this.percent = Math.round(val*100/this.max) ;
				obj = {
					percent : this.percent ,
					value : val
				} ;
			}
			else{
				this.value = val.value ;
				this.percent = Math.round(this.value*100/this.max) ;
				obj = $.extend({percent : this.percent} , val) ;
			}
			this.barDiv.stop().animate({"width" : this.percent+'%'} , 500) ;

			if(this.showLabel) this.setLabel(obj) ;

			if (typeof this.onChange === 'function') this.onChange(obj);
			if (this.value >= this.max && typeof this.onComplete === 'function') this.onComplete(obj);
		},
		setLabel : function(val){
			var h = fy.formatJSON(this.labelTemplate , val);
			this.msgdiv.html(h) ;
		}
	};

	fy.register("progressBar", progressBar , "DisplayObject");

})(window, jQuery, fy);






