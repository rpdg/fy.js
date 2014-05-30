/**
 *
 * list component
 * @method
 */
;
(function (window, $, fy, undefined) {

	var List = function (jq, cfg) {
		//initialize defaults
		var def = {
			textSrc:"text",
			selectedIndex:-1,
			bindOptions:{}
		};
		var renderer = '' ,
			sets = $.extend(def , cfg);
		if (sets.renderer && !sets.bindOptions.itemRender) {
			var fnName = "renderer" ;
			renderer = ':='+ fnName ;
			sets.bindOptions.itemRender = {};
			sets.bindOptions.itemRender[fnName] = sets.renderer ;
		}

		if(!sets.bindOptions.template)
			sets.bindOptions.template = sets.template || '<li>{' + sets.textSrc + renderer + '}</li>';

		//call super constructor
		List.parent.call(this, jq, sets);

		//self attributes
		this.selectedClass = sets.selectedClass || "current";
		this.selectedIndex = sets.selectedIndex;
		this.eventType = "click.fy";
		this.title = sets.title;
		//如果是从空容器创建的，将jq对象指定到<ul>控件上
		if (this.jq[0].tagName !== 'UL')
			this.jq = $('<ul class="fui-list" style="width: 100%; height: 100%; margin: 0; padding: 0;"></ul>').appendTo(this.jq);
		else
			this.jq.addClass("fui-list");


		if(!this.lazy) this.create(sets);

	};

	List.prototype = {
		/*htmlMashup : function (isInCreating) {
			this.createHandler() ;
		},*/
		createHandler:function (json) {
			var that = this;
			this.items = this.jq.find("li");
			if (this.title) {
				this.jq.prepend('<div class="listHead">' + this.title + '</div>');
			}

			//add event listener
			this.jq.delegate("li", this.eventType, function (evt) {
				that.selectHandler(evt, that.selectedIndex);
			});

			if (this.selectedIndex !== -1) {
				this.items.eq(this.selectedIndex).trigger(this.eventType);
			}

			if (typeof this.onCreate === 'function') this.onCreate(json);
		},
		updateHandler:function (json, isInCreating) {
			if (!isInCreating) this.items = this.jq.find("li");
			if (typeof this.onUpdate === 'function') this.onUpdate(json , isInCreating);
			if (typeof this.onUpdateOnce === 'function') {
				this.onUpdateOnce(json ,isInCreating) ;
				delete this.onUpdateOnce ;
			}
		},
		setSelectedIndex:function (i) {
			//this.selectedIndex = i;
			this.items.eq(i).trigger(this.eventType);
			return this;
		},

		selectHandler:function (evt) {
			var cur = this.items.index(evt.currentTarget);
			if (cur === this.selectedIndex && this.prevIndex != -1) return;

			this.prevIndex = this.selectedIndex;
			this.selectedIndex = cur;
			this.items.eq(this.prevIndex).removeClass(this.selectedClass);
			$(evt.currentTarget).addClass(this.selectedClass);

			if (typeof this.onSelect === 'function') this.onSelect(evt);
		}
	};

	fy.register("list", List, "ListBase");
})(window, jQuery, fy);