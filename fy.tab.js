/**
 *  tabView

 @param eventType :
 @param autoHeight :

 @event onError
 */
;
(function (window, $, fy, undefined) {
	var TabViewer = function (jq, cfg) {
		//initialize defaults
		var that = this ,
			sets = $.extend({eventType:"click", autoHeight:true}, cfg);

		//call super constructor
		TabViewer.parent.call(this, jq, sets);

		//self attributes
		this.tabNavigation = $('ul.tabUL', jq).eq(0);
		if (!this.tabNavigation.length) {
			this.tabNavigation = $('<div class="tabNavigator"><div class="tabWrap"><ul class="tabUL"></ul></div></div>').appendTo(jq).find('ul.tabUL');
		}

		var tabWrap = this.tabNavigation.parent() , pt = tabWrap.parent() ;
		if(!pt.hasClass('tabNavigator')){
			tabWrap.wrap('<div class="tabNavigator"></div>') ;
		}


		this.tabNavigation.delegate(".tabCloser", "click", function (evt) {
			that.removeTab($(evt.target).parent());
		});

		this.autoHeight = sets.autoHeight ;


		if (sets.eventType == 'mouseover' || sets.eventType == 'hover') {
			sets.eventType = 'mouseenter';
		}
		//
		this.eventType = sets.eventType ;

		var $tabLi = this.tabNavigation.find("li") , tabLi , tabTargetId;
		this.tabItems = { length: $tabLi.length };
		for (var i = 0 , l = $tabLi.length; i < l; i++) {
			tabLi = $tabLi.eq(i);
			tabTargetId = tabLi.attr("tab");
			this.tabItems[tabTargetId] = tabLi;

			if (this.closable)
				$('<div class="tabCloser"></div>').prependTo(tabLi);
		}

		if(typeof sets.onAddTab === "function"){
			this.onAddTab = sets.onAddTab ;
			delete sets.onAddTab;
		}
		if(typeof sets.onRemoveTab === "function"){
			this.onRemoveTab = sets.onRemoveTab ;
			delete sets.onRemoveTab;
		}
		if(typeof sets.onOpenTab === "function"){
			this.onOpenTab = sets.onOpenTab ;
			delete sets.onOpenTab;
		}

		this.create(sets);

	};

	TabViewer.prototype = {

		create: function(sets){
			if (typeof this.onInit === 'function') this.onInit() ;
			this.jq.doTab(sets) ;

			//if(this.autoHeight) this.adjustHeight() ;

			this.createHandler(this.data) ;

			if (this.autoHeight) {
				var rzTimer = 0 , that = this ;
				$(window).resize(function () {
					if (rzTimer) clearTimeout(rzTimer);
					rzTimer = setTimeout(function(){that.adjustHeight()}, 50);
				});
			}

			return this;
		} ,

		adjustHeight:function () {
			var h = this.jq.innerHeight() - this.jq.find("ul.tabUL").outerHeight();
			//log("b" , this.jq.innerHeight(), this.jq.find("ul.tabUL").outerHeight());
			if(h < 60) return;
			this.jq.find("div.tabDivision").css("height", h-2);
			//this.jq.find("div.tabDivision").css("marginTop", h-2);
		},

		//sets can be the index(int) or the ID (string with/without '#')
		getBox:function (sets) {
			if (typeof sets === 'number') return this.jq.find("div.tabDivision").eq(sets);
			else if (typeof sets === 'string') {
				var makeId = sets.indexOf("#") === -1 ? "#"+sets : sets;
				return $(makeId , this.jq)
			}
			else return this.getBox(0) ;
		},

		//sets can be the index(int) or the ID (string with/without '#')
		// Or the config object to creat a new tab and open it
		// example : .open({id:"dasd" , title:"sdssd" , src:"http://www.baidu.com" , closable:1})
		openTab:function (sets) {
			var makeId ;
			if (typeof sets === 'number') {
				this.tabNavigation.find("li").eq(parseInt(sets , 10)).trigger(this.eventType);
				if(typeof this.onOpenTab === "function") this.onOpenTab();
			}
			else if (typeof sets === 'string') {
				makeId = sets.indexOf("#") === -1 ? "#"+sets : sets;
				this.tabItems[makeId].trigger(this.eventType);
				if(typeof this.onOpenTab === "function") this.onOpenTab();
			}
			else {
				makeId = sets.id.indexOf("#") === -1 ? "#"+sets.id : sets.id ;
				if (!this.tabItems[makeId]) this.addTab($.extend({id:makeId}, sets));
				return this.openTab(makeId) ;
			}
			return this;
		},

		//add a new tab stack，
		// .add({id:"dasd" , title:"sdssd" , content:’<b>hello</b>’})
		// iframe usage
		// .add({id:"dasd" , title:"sdssd" , src:’<b>hello</b>’})
		//@event : onAddTab
		addTab:function (sets) {
			var makeId = sets.id ;
			if (makeId.indexOf("#") === -1) makeId = "#" + makeId;
			var realId = makeId.substr(1) ;
			var tabNav = $('<li tab="' + makeId + '">' + sets.title + '</li>').appendTo(this.tabNavigation);
			var tabView = $('<div id="' + realId + '" class="tabDivision"></div>').appendTo(this.jq);
			var clearDiv = this.tabNavigation.find("div.clear") ;
			if(clearDiv.length) clearDiv.appendTo(this.tabNavigation) ;
			else this.tabNavigation.append('<div class="clear"></div>') ;

			//if (this.autoHeight) tabView.css({"height" : "100%" });
			if (sets.content) tabView.append(sets.content);
			if (sets.src) tabView.append('<iframe id="tab_iframe_'+realId+'" name="tab_iframe_named_'+realId+'" src="' + sets.src + '" style="width:100%; height:100%; margin:0;padding:0" />');

			if (sets.closable) {
				var closer = $('<div class="tabCloser"></div>').prependTo(tabNav);
			}

			this.tabItems[makeId] = tabNav;
			this.tabItems.length++;

			if(this.autoHeight) {
				this.adjustHeight() ;
			}

			if(typeof this.onAddTab === "function") this.onAddTab();

			return this;
		},

		//删除指定的tab页。param可以是id(带不带#均可)，或li的jQuery对象
		//@event : onRemoveTab
		removeTab:function (tab) {
			var fakeId , x , key;
			if (typeof tab === "string") {
				fakeId = tab;
				if (fakeId.indexOf("#") === -1) fakeId = "#" + fakeId;
				tab = this.tabNavigation.find("li[tab='" + fakeId + "']");
			}
			else fakeId = tab.attr("tab");
			if (tab.hasClass("current")) {
				x = this.tabNavigation.find("li").filter(".current").index();
				if (x) key = this.tabNavigation.find("li:eq(" + (--x) + ")").attr("tab");
				else key = this.tabNavigation.find("li:eq(" + (++x) + ")").attr("tab");
				if (this.tabItems.length > 1) this.openTab({id:key});
			}
			delete this.tabItems[fakeId];
			this.tabItems.length--;
			$(fakeId).remove();
			tab.remove();

			if(typeof this.onRemoveTab === "function") this.onRemoveTab();

			return this;
		}
	};

	fy.register("tab", TabViewer, "DisplayObject");
})(window, jQuery, fy);



(function (jQuery) {
	jQuery.fn.extend({
		doTab: function (sets) {
			var settings = jQuery.extend({initTabIndex: 0 , delay: 100 , eventType: "mouseenter"} , sets);
			var oId = "#" + jQuery(this).attr("id");

			var changeTab = function ($li , $div) {
				//trace($li, $div);
				$div.show().siblings("div.tabDivision:visible").hide();
				$li.addClass("current").siblings("li.current").removeClass("current");

				//coll back
				if(typeof settings.onChange === 'function') {
					settings.onChange($ul.find("li").index($li) , $li , $div) ;
				}
			};

			//log(oId);
			jQuery(oId + ' > div.tabDivision').eq(settings.initTabIndex).show();
			var $ul = jQuery(oId + ' ul.tabUL')
				.find("li:eq(" + settings.initTabIndex + ")").addClass("current")
				.end()
				.delegate("li" , settings.eventType + ".doTab" , function (evt) {
					var $t = jQuery(evt.target);
					var toTab = $t.attr("tab");
					//alert(toTab) ;
					var $tab = jQuery(toTab);

					if ($tab.css("display") != "block") {
						if (settings.eventType == "mouseenter") {
							function goTab() {
								changeTab($t , $tab);
							}

							$t.data("timer" , setTimeout(goTab , settings.delay));
						}
						else changeTab($t , $tab);
					}
				});
			if (settings.eventType == "mouseenter") {
				$ul.delegate("li" , "mouseleave.doTab" , function () {
					var $t = jQuery(this);
					clearTimeout($t.data("timer"));
					$t.data("timer" , null);
				})
			}
			return this ;
		} ,
		undoTab: function () {
			jQuery('ul.tabUL' , this).undelegate("li" , ".doTab");
			return this ;
		}
	})
})(jQuery);


/**
 *  tabBar
 */

(function (window, $, fy, undefined) {
	var TabBar = function (jq, cfg) {
		//initialize defaults
		var def = {
			eventType:"click",
			selectedIndex: 0 ,
			labelField : 'label'
		} ;
		if(cfg.iconField) def.template = '<li><img class="tabIco" src="{'+ cfg.iconField +'}">{'+ (cfg.labelField || def.labelField) +'}</li>' ;
		else def.template = '<li>{'+ (cfg.labelField || def.labelField) +'}</li>' ;

		var sets = $.extend(def, cfg);


		if(cfg.data && (typeof cfg.data[0] === 'string')){
			var arr = [] ;
			for(var i=0 , l = cfg.data.length ; i < l ; i++){
				arr[i] = {} ;
				arr[i][sets.labelField] =  cfg.data[i] ;
			}
			sets.data = arr ;
		}

		//call super constructor
		TabBar.parent.call(this, jq, sets);


		//self attributes
		if (sets.eventType.indexOf('mouse')>-1 || sets.eventType === 'hover') sets.eventType = 'mouseenter';
		this.eventType = sets.eventType + ".fy" ;
		this.initSelectedIndex = this.selectedIndex = sets.selectedIndex  ;
		this.autoFire = !!sets.autoFire ;


		this.jq = $('ul.tabUL', jq).eq(0);
		if (!this.jq.length) {
			this.jq = $('<div class="tabNavigator"><div class="tabWrap"><ul class="tabUL"></ul></div></div>').appendTo(jq).find('ul.tabUL');
		}


		if(sets.onSelect) this.onChange = sets.onSelect ;

		this.create(sets);

	};

	TabBar.prototype = {
		createHandler: function(json){

			/*
			var nv = this.jq.parents('.tabNavigator') ;
			var pW = nv.width() , jW = this.jq.width() ;

			if(jW > pW) {
				//nv.width(pW - 30) ;
				//nv.before('<div class="tabsScroller-right">»</div><div class="tabsScroller-left">«</div>') ;
				//
			}
			*/

			var that = this , fn , timer ;

			//to optimize mouse hover 's user experience
			if(this.eventType === 'mouseenter.fy') {
				fn = function(evt){
					timer = setTimeout(function(){
						that.selectHandler.call(that , evt) ;
					} , 150) ;
				} ;
				this.jq.delegate("li" , "mouseleave.fy" , function(){
					clearTimeout(timer) ;
				});
			}
			else fn = function(evt){
				that.selectHandler.call(that , evt) ;
			} ;

			this.jq.on(this.eventType , "li" , fn);

			if (typeof this.onCreate === 'function') this.onCreate(json) ;

			return this;
		},
		bindHandler : function(json , isInCreating) {
			this.items = this.jq.find("li");

			this.selectedIndex = (this.items.length > this.initSelectedIndex) ? this.initSelectedIndex : (this.items.length?0:-1) ;
			this.prevIndex = -1 ;

			if (typeof this.onBind === 'function') this.onBind(json , isInCreating) ;

			if(this.autoFire && this.selectedIndex > -1){
				var that = this ;
				setTimeout(function(){
					that.setSelectedIndex(that.selectedIndex) ;
				} , 0) ;
			}

		}
		, selectHandler : function(evt){
			var li = evt.target , i = this.items.index(li) ;
			if (i === this.selectedIndex && this.prevIndex != -1) return;

			$(li).addClass("current").siblings("li.current").removeClass("current");

			this.prevIndex = this.selectedIndex;
			this.selectedIndex = i;

			if (typeof this.onSelect === 'function') this.onSelect(evt);
		}
		, setSelectedIndex:function (i) {
			this.jq.find("li:eq(" + i + ")").trigger(this.eventType);
			return this;
		}
	};

	fy.register("tabBar", TabBar, "ListBase");
})(window, jQuery, fy);