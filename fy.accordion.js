/**
 *
 * accordion

 @param (string) eventType 触发切换的事件名
 @param (boolean) autoHeight 是否固定高度

 @function openBox
 @function getBox
 @function getBar

 @event onInit :
 @event onCreate
 @event onSelect
 @event onError
 */
;
(function (window, $, fy, undefined) {
	var Accordion = function (jq, cfg) {
		//initialize defaults
		var renderer ,
			sets = $.extend({bindOptions:{}, textSrc : "text", selectedIndex:0, autoHeight: false, eventType:"click" }, cfg);
		if (cfg.renderer) {
			renderer = ':=render';
			sets.bindOptions.itemRender = {render: cfg.renderer};
		}
		else renderer = '';

		var iconSrc = sets.iconSrc ? '<img src="{'+sets.iconSrc+'}" class="accIco" align="absmiddle" />' : '' ;

		sets.bindOptions.template = sets.template || '<li><div class="accHead">'+iconSrc+'{' + sets.textSrc + renderer + '}</div><div class="accBox"></div></li>';

		//call super constructor
		Accordion.parent.call(this, jq, sets);

		//self attributes
		//如果是从空容器创建的，将jq对象指定到<ul>控件上
		if (this.jq[0].tagName.toLowerCase() !== 'ul')
			this.jq = $('<ul class="accUL"></ul>').appendTo(this.jq);

		this.selectedIndex = sets.selectedIndex ;
		this.selectedClass = sets.selectedClass;
		this.autoHeight = !!sets.autoHeight;
		this.boxHeight = 0;
		this.eventType = sets.eventType;
		this.stacks = jq.children("li");
		this.onSelect = sets.onSelect ;

		if(!this.lazy) this.create(sets);
	};

	Accordion.prototype = {
		/*htmlMashup :function (){
			var item , label , ico , html ;
			this.stacks = this.jq.find("li");
			for (var i = 0 , l = this.stacks.length; i < l; i++) {
				item = this.stacks.eq(i);
				html = item.html();
				item.html("");
				label = item.attr('label') || "";
				ico = item.attr('ico');
				ico = ico ? '<img src="' + ico + '" class="accIco" align="absmiddle" />' : '';
				item.append('<div class="accHead">' + ico + label + '</div>').append('<div class="accBox">' + html + '</div>');
			}

			this.createHandler() ;
		},*/
		adjustHeight: function(){
			this.boxHeight = this.jq.innerHeight() - this.stacks.find(".accHead").eq(0).outerHeight() * this.stacks.length;
			this.jq.find(".accBox").outerHeight(this.boxHeight);
		},
		createHandler:function (json) {
			var that = this;
			this.stacks = this.jq.children("li");

			this.boxHeight = this.jq.innerHeight() - this.stacks.find(".accHead").eq(0).outerHeight() * this.stacks.length;

			if (this.autoHeight) {
				this.jq.find(".accBox").css("height", this.boxHeight);
				var rzTimer = 0;
				$(window).resize(function () {
					if (rzTimer) clearTimeout(rzTimer);
					rzTimer = setTimeout(function(){that.adjustHeight()}, 50);
				});
			}

			this.jq.delegate(".accHead", this.eventType, function (evt) {
				evt.stopImmediatePropagation();
				var src = $(evt.currentTarget) ,
					li = src.parent() ,
					index = that.stacks.index(li);
				if (index === that.selectedIndex && that.prevIndex != -1) return ;

				that.prevIndex = that.selectedIndex;
				that.selectedIndex = index;

				that.stacks.eq(that.prevIndex).children(".accBox.current").removeClass("current").slideUp(100) ;
				that.stacks.eq(index).children(".accBox").addClass("current").slideDown(100);

				if(that.selectedClass){
					that.stacks.find("."+that.selectedClass).removeClass(that.selectedClass) ;
					$(evt.currentTarget).addClass(that.selectedClass) ;
				}

				if (typeof that.onSelect === 'function') that.onSelect(evt) ;

			});

			if (typeof this.onCreate === 'function') this.onCreate(json);

			this.openBox(this.selectedIndex);

			return this;

		},

		openBox : function(i) {
			this.jq.find(".accHead").eq(i).trigger(this.eventType) ;
		} ,

		//index(int)
		getBox:function (i) {
			return this.stacks.eq(i).find(".accBox") ;
		} ,

		getBar :function(i) {
			return this.stacks.eq(i).children(".accHead") ;
		}
	};

	fy.register("accordion", Accordion, "ListBase");
})(window, jQuery, fy);