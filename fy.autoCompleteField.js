;
(function (window, $, fy, undefined) {

	function filter(sets) {
		var val = $.trim(this.jq.val()) ;
		if(val){
			var list = this.list , arr = [] ;
			for (var i = 0, l = this.data.length; i < l; i++) {
				var item = this.data[i];
				if (item[sets.textSrc].indexOf(val) !== -1) {
					arr.push(item) ;
					if(arr.length === sets.maxEntries) break;
				}
			}
			if(arr.length){
				list.bindData({data:arr});
				this.open();
				//high light keywords
				list.items.each(function(i, obj){
					var li = $(obj) ;
					li.html(li.text().replace(val,'<span class="fBlue fBold">'+val+'</span>')) ;
				});
			}
			else{
				this.list.bindData({data: [] });
				this.close() ;
			}
		}
		else{
			this.list.bindData({data: [] });
			this.close();
		}
	}



	var AutoComplete = function(jq, cfg){
		var sets = $.extend({
				enabled : true ,
				textSrc: "text" ,
				maxEntries:5 ,
				selectedClass:"autoComplete-hi"
			}, cfg ) ,
			that = this ;

		this.enabled = sets.enabled ;
		this.list = fy('<ul class="combo-dropDown autoComplete"><li class="fLightGray">loading...</li></ul>').list(sets) ;
		this.list.onSelect = function(){
			var li = this.getSelectedItem() ;
			that.jq.val($.text(li)) ;
		};


		this.list.onCreate = function(json){
			that.data = json.data ;
			this.bindData({data: []});
			//log(sets.target)
			this.jq.css({
				//maxHeight : this.items.length? this.items.eq(0).css("line-height")*sets.maxEntries : 120 ,
				width: that.jq.width()
			}).click(function(){
				that.close() ;
			}) ;
			//

			that.jq.bind("keyup.fyDropdown" , function(evt){
				if(!that.enabled) return ;
				var val = $.trim(that.jq.val()) ;
				//if(!val) return false;
				var keyCode = evt.keyCode , list = that.list ;
				//log(val.length , keyCode);
				if(keyCode === 38 || keyCode === 40){
					if(list.selectedIndex === -1){
						list.setSelectedIndex(0);
					}
					else{
						var c = list.selectedIndex ;
						if(keyCode === 38) {
							if(c===0) c = list.items.length-1 ;
							else c-- ;
						}
						else {
							if(c===list.items.length-1) c = 0 ;
							else c++ ;
						}
						list.setSelectedIndex(c) ;
					}
				}
				else if(keyCode===13){
					that.close() ;
				}
				else{
					filter.call(that , sets) ;
				}
				return false;
			})/*.bind('blur.fyDropdown' , function(){
				that.close();
			})*/ ;
		} ;

		//sets.target = $('<div class="autoComplete"></div>').append(this.list.jq).appendTo("body");
		sets.target = this.list.jq.appendTo("body");
		sets.onBeforeOpen = function(){
			if(!$.trim(that.jq.val()) || !that.list.data.length) return false ;
		};

			//call super constructor
		//sets.eventType = "input" ;
		AutoComplete.parent.call(this, jq, sets);
		this.position();
	};

	AutoComplete.prototype = {
		enable : function(){
			this.enabled = true ;
		} ,
		disable : function(){
			this.enabled = false ;
		}
	};

	fy.register("autoComplete", AutoComplete, "ComboBase");

})(window, jQuery, fy);