;
(function (window, $, fy, undefined) {
	var oDay = new Date ,
		today = new Date(oDay.getFullYear() , oDay.getMonth() , oDay.getDate() ) ,
		schoolOpen = adjustSchoolOpen(today) ;


	function adjustSchoolOpen(day){
		var sd , tsd ;
		if(day.getMonth() < 8)
			sd = new Date(day.getFullYear()-1 , 8 , 1 );
		else
			sd = new Date(day.getFullYear() , 8 , 1 ) ;

		if (sd.getDay() == 0)
			tsd = new Date(sd.getFullYear() , 8 , 2) ;
		else if (sd.getDay() == 6)
			tsd = new Date(sd.getFullYear() , 8 , 3) ;
		else
			tsd = sd ;

		return tsd;
	}


	var DateChooser = function(jq, cfg){
		var sets = $.extend({
			today : today ,
			schoolOpen : schoolOpen,
			selectedDate : today ,
			showToday : false ,
			showWeekNum : true ,
			//disabledDays : null ,
			//disabledRanges : null ,
			//selectableRange : null ,
			//yearFrom : 1900 ,
			//yearTo : 2099 ,
			sundayIsWeekend : false ,
			dayNames : ["日", "一", "二", "三", "四", "五", "六"] ,
			monthNames : null ,
			symbols : ["年","月","周次"]
		}, cfg);

		//call super constructor
		DateChooser.parent.call(this, jq, sets) ;

		//self attributes
		this.sundayIsWeekend = sets.sundayIsWeekend ;
		this.showToday = sets.showToday ;

		//[events]
		//选中日期时触发
		this.onChoose = sets.onChoose ;
		//选中周次触发
		this.onChooseWeek = sets.onChooseWeek ;

		//如果每次进入月历都要触发，则用 onCalendarEnter
		this.onCalendarEnter = sets.onCalendarEnter ;

		//如果要月历改变时触发，使用onChange
		this.onChange = sets.onChange ;

		this.today = (typeof sets.today === "string" ? fy.parseDate(sets.today) : sets.today) ;


		if(cfg.schoolOpen)
			this.schoolOpen = (typeof sets.schoolOpen === "string" ? fy.parseDate(sets.schoolOpen) : sets.schoolOpen) ;
		else
			this.schoolOpen = adjustSchoolOpen(this.today);


		this.begin = null;
		this.showWeekNum = !!sets.showWeekNum ;

		if(cfg.selectedDate)
			this.selectedDate = (typeof sets.selectedDate === "string" ? fy.parseDate(sets.selectedDate) : sets.selectedDate)  ;
		else
			this.selectedDate = this.today ;

		this.monthNames = sets.monthNames|| ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'] ;
		this.symbols = sets.symbols ;
		this.showState = 0 ;

		//create
		//this.makeCalendar(sets);
		this.lastDrawn = {} ;
		this.create(sets);
	};
	DateChooser.prototype = {
		// 最后一个参数日期可以不指定, 如果指定则会自动选中那个日期,
		// 这个方法与 setSelectedDate 的区别是 goto 方法可以使日历导航到某个月份而不选中某个日期
		goto : function(ye, mo , da){
			ye = parseInt(ye ,10) ;
			mo = parseInt(mo ,10) ;
			if(da) {
				this.setSelectedDate(ye + "-" + mo + "-" + da ) ;
			}
			else{
				this.selectedYear = ye ;
				this.selectedMonth = mo ;
				this.drawMonthly( ye , mo );
			}
			return this;
		} ,
		drawMonthly: function (ye, mo , direction) {
			this.toggler.text(ye + this.symbols[0] + mo + this.symbols[1]) ;

			if(this.lastDrawn.year!= ye || this.lastDrawn.month!=mo){
				this.lastDrawn.year = ye ;
				this.lastDrawn.month = mo ;
				this.rewriteDayTds(ye, mo) ;

				if(typeof this.onChange === 'function') this.onChange.call(this , this.dateTds , direction||'enter') ;
			}
			else if(typeof this.onCalendarEnter === 'function') {
				this.onCalendarEnter.call(this , this.dateTds , direction||'enter') ;
			}
			//
			return this;
		},
		mkDateArr: function (y, m) {
			var DayArray = [] ,
				i = 0 ,
				lastDate = new Date(y, m, 0).getDate() ,
				firstDay = new Date(y, m - 1, 1).getDay();

			if (this.sundayIsWeekend) {
				firstDay--;
				if (firstDay < 0) firstDay = 6;
			}

			for (; i < lastDate; i++) {
				if (this.begin && (parseInt("" + y + fy.padLeft(m) + fy.padLeft(i + 1), 10) < this.begin)) {
					DayArray[i + firstDay] = "";
				}
				else {
					DayArray[i + firstDay] = i + 1;
				}
			}
			i = 42;
			while (i--) {
				if (!DayArray[i]) DayArray[i] = "&nbsp;";
			}
			return DayArray;
		},
		create : function (sets){
			if (typeof this.onInit === 'function') this.onInit();

			var htm_dateTd = '<td class="TdOut"></td>' , 
				htm_dateTds = sets.showWeekNum ? '<td class="TdWeek"></td>' : '' , 
				colSpan = sets.showWeekNum ? 8 : 7 , 
				htm_dateTrs = '' , 
				weekHead = sets.showWeekNum? '<td class=TdWeek>'+sets.symbols[2]+'</td>' : ''  ;

			for (i = 0; i < 7; i++)  htm_dateTds += htm_dateTd ;
			var htm_dateTr = '<tr>' + htm_dateTds  + '</tr>' ;
			for (i = 0; i < 6; i++) htm_dateTrs += htm_dateTr ;

			var htm_table_select = '<table class="tbCalendarHeader"><tr><td class="signal jmpPrev">«</td>' +
				'<td class="tdCalendarHeader"></td>' +
				'<td class="signal jmpNext">»</td></tr></table>';

			var tbSelector = $(htm_table_select).appendTo(this.jq) ;
			this.toggler = tbSelector.find('.tdCalendarHeader') ;
			tbSelector[0].onselectstart = fy.PREVENT_FN;

			var htm_table = '<table class="TbDateChooser"><thead style="height:24px;"><tr class="trDayName"></tr></thead>' +
				'<tbody class="tbdDate">' + htm_dateTrs + '</tbody></table>' ;
			this.calendar = $(htm_table).appendTo(this.jq).css({height : this.jq.height() - tbSelector.height()}) ;
			this.tds = this.calendar.find("td.TdOut");
			this.weekTds = this.calendar.find("td.TdWeek");

			this.ymTable = $('<table class="ymTable"><tr><td class="yearTd"></td></tr></table>').appendTo(this.jq).css("height" ,this.calendar.height()) ;
			this.selector = this.ymTable.find('.yearTd') ;

			this.goto(this.selectedDate.getFullYear() , this.selectedDate.getMonth() + 1 );

			//set week day name
			if(this.sundayIsWeekend) sets.dayNames.push(sets.dayNames.shift());
			this.calendar.find(".trDayName").html(weekHead+'</td><td class=TrOut>' + sets.dayNames.join('</td><td class=TrOut>') + '</td>');


			//Bind Events
			var that = this ;
			this.toggler.click(function(){
				that.showState = (++that.showState)%3 ;
				that.toggleView(that.showState) ;
			}) ;
			this.selector.delegate('td' , 'click' , function(e){
				that.showState = (--that.showState)%3 ;
				that.toggleView(that.showState , $.text(this)) ;
			}) ;

			this.toggler.siblings(".jmpPrev").click(function () {
				that.jumpPrev(that.showState);
				/*if(!that.showState && typeof that.onChange === 'function') {
					that.onChange(that.dateTds , 'prev') ;
				}*/
			});

			this.toggler.siblings(".jmpNext").click(function () {
				that.jumpNext(that.showState);
				/*if(!that.showState && typeof that.onChange === 'function') {
					that.onChange(that.dateTds , 'next') ;
				}*/
			});

			var tbody = this.calendar.find(".tbdDate") ;

			tbody.delegate("td.TdOut", "click", function (e) {
				//e.stopPropagation();
				var d = $(this).data('date');
				if (d && $.trim(d)) {
					that.chooseHandler(new Date(that.selectedYear , that.selectedMonth - 1, parseInt(d, 10)) , e.currentTarget);
				}
			}).find("tr").css("height" ,(this.calendar.height()-24)/6);

			//
			if(this.showWeekNum && typeof this.onChooseWeek === 'function') {
				tbody.delegate('.TdWeek', 'click', function (e) {
					that.onChooseWeek(parseInt($.text(e.currentTarget ,10)));
				});
			}

			//
			this.createHandler(this.selectedDate);
			return this;
		},
		toggleView : function(t , x){
			if(t){
				switch(t){
					case 3 :{
						break ;
					}
					case 2 :{
						var ys = Math.floor((x||this.selectedYear)*0.1)*10 ;
						this.toggler.text(ys + ' - ' + (ys+10) + this.symbols[0]);

						var i = 0 , html = [] ;
						for( ; i < 11 ; i++){
							html[i] = '' ;
							var cls = (ys === this.selectedYear) ?' class="current"' : '' ;
							if(!(i%4)) html[i] += '<tr>' ;
							html[i] += '<td'+ cls +'>'+ (ys++) +'</td>' ;
							if(i%4 === 3 ) html[i] += '</tr>' ;
						}
						this.selector.html('<table>' + html.join('') + '</table>');
						break ;
					}
					case 1 :{
						if(x) this.selectedYear = parseInt(x , 10) ;
						this.toggler.text(this.selectedYear + this.symbols[0]);

						var arr = this.monthNames , i = 0 , html = [] ;
						for( ; i < 12 ; i++){
							html[i] = '' ;
							var cls = (i+1 === this.selectedMonth) ?' class="current"' : '' ;
							if(!(i%4)) html[i] += '<tr>' ;
							html[i] += '<td'+cls+'>'+ arr[i] +'</td>' ;
							if(i%4 === 3 ) html[i] += '</tr>' ;
						}

						this.selector.html('<table>' + html.join('') + '</table>');
						this.calendar.hide() ;
						this.ymTable.show() ;
						break ;
					}
				}
			}
			else{
				if(x) this.selectedMonth = $.inArray(x , this.monthNames)+1 ; 
				this.drawMonthly(this.selectedYear , this.selectedMonth ) ; 
				this.ymTable.hide() ; 
				this.calendar.show() ; 
			}
		} ,
		chooseHandler : function(date , td){
			this.selectedDate = date ;
			this.tds.filter(".selectedDate").removeClass("selectedDate");
			this.selectedTD = $(td).addClass("selectedDate") ;

			if (typeof this.onChoose === 'function') this.onChoose( date , this.selectedTD );
		},
		rewriteDayTds:function (y, m) {
			//date
			var arr = this.mkDateArr(y, m) , d , t , that = this , $td;
			this.tds.removeClass("today").removeClass("selectedDate").each(function (i, o){
				t = arr[i] ;
				$td = $(o).removeAttr('style').unbind().removeData()  ;
				if(!isNaN(t)) {
					d = new Date(that.selectedYear , that.selectedMonth-1 , parseInt(t, 10));
					if(that.showToday && (d.getTime() == that.today.getTime())) {
						$td.addClass("today");
					}
					if(d.getTime() == that.selectedDate.getTime() ) {
						$td.addClass("selectedDate");
					}

					$td.html(t).data('date' , parseInt(t , 10));
				}
				else{
					$td.html(t) ;
				}

			});

			//week num
			//log(arr) ;
			if(this.showWeekNum) this.rewriteWeek(y, m);

			this.dateTds = [] ;
			for (var xi = 0 ; xi < arr.length ; xi++){
				if(arr[xi] !== '&nbsp;')
					this.dateTds.push(this.tds[xi]) ;
			}
			this.dateTds = $(this.dateTds) ;

			if(typeof this.onCalendarEnter === 'function') {
				this.onCalendarEnter(this.dateTds) ;
			}

			return this;
		},
		rewriteWeek:function (y, m) {
			var firstDate = new Date(y, m - 1, 1);
			var monthStartWeek = fy.weekSpan(firstDate, this.schoolOpen);
			if(!this.sundayIsWeekend && firstDate.getDay() === 0) monthStartWeek++ ;
			this.weekTds.each(function () {
				$(this).text(monthStartWeek++);
			});
			return this;
		},

		jumpPrev:function (t) {
			switch(t){
				case 0 :{
					this.selectedMonth = this.selectedMonth - 1;
					if (this.selectedMonth == 0) {
						--this.selectedYear;
						this.selectedMonth = 12;
					}
					this.drawMonthly(this.selectedYear , this.selectedMonth , 'prev');
					break ;
				}
				case 1:{
					this.toggler.text(--this.selectedYear + this.symbols[0]) ;
					break ;
				}
				case 2:{
					this.toggleView(2 , parseInt(this.selector.find("td:first").text() , 10) -10 ) ;
					break ;
				}
			}
		},
		jumpNext:function (t) {
			switch(t){
				case 0 :{
					this.selectedMonth = this.selectedMonth + 1;
					if (this.selectedMonth == 13) {
						++this.selectedYear;
						this.selectedMonth = 1;
					}
					this.drawMonthly(this.selectedYear, this.selectedMonth , 'next') ;
					break ;
				}
				case 1:{
					this.toggler.text(++this.selectedYear + this.symbols[0]) ;
					break ;
				}
				case 2:{
					this.toggleView(2 , parseInt(this.selector.find("td:first").text() , 10) +10 ) ;
					break ;
				}
			}

		},

		getSelectedDate:function(){
			return this.selectedDate.getDate() ;
		},

		setSelectedDate: function(d){
			this.selectedDate = (typeof d === "string" ? fy.parseDate(d) : d) ;
			this.goto(this.selectedDate.getFullYear() , this.selectedDate.getMonth()+1);
			return this ;
		} ,

		//TODO: 未触发 onCalendarEnter 事件
		select : function(d){
			this.setSelectedDate(d);//.chooseHandler(this.selectedDate , this.jq.find(".selectedDate"));
			this.getTDByDate(d).trigger('click');
			return this;
		} ,

		//
		getDateByTd : function(tds){
			var arr = [];
			var y = this.selectedYear , m = this.selectedMonth ;
			tds.each(function(i , td){
				var d = tds.eq(i).data('date') ;
					if(d) {
						arr.push(new Date(y , m , d)) ;
					}
			}) ;
			return arr ;
		} ,

		//按周次取一周td
		getTDByWeekNum : function(num){
			var wtd , tds = [] ;
			this.weekTds.each(function(i , wTd){
				if($.text(wTd) == num) {
					wtd = $(wTd) ;
					return false ;
				}
			}) ;
			if(wtd && wtd.length){
				var row = wtd.parent('tr').find('.TdOut') ;
				row.each(function(i , td){
					if($(td).data('date')) tds.push(td) ;
				});
			}
			return $(tds) ;
		} ,


		//获取某个日期的周次
		getTDWeekNum : function(date){

			var str = "不在当前月中" ;
			if(this.showWeekNum) {
				var $td = date ? this.getTDByDate(date) : this.selectedTD ;
				if($td.length){
					str = $td.parent().find(".TdWeek").text() ;
				}
			}
			else str = "未设定显示周次" ;
			return str ;
		} ,

		// sunday -> 0
		getTDByDay : function(d){
			var odd = d ;
			if(this.showWeekNum) d++ ;
			//alert(this.sundayIsWeekend)
			if(this.sundayIsWeekend){
				d = odd ? --d: d+6 ;
			}
			var arr = [] ;
			this.getTDmonthly().each(function(i,o){
				if(o.cellIndex === d){
					arr.push(o) ;
				}
			}) ;
			return $(arr) ;
		} ,
		getTDByDate : function(date){
			var tds = this.dateTds  ,
				dateTo = (typeof date === "string" ? fy.parseDate(date) : date) ,
				m = this.selectedMonth ,
				y = this.selectedYear ;
			if(y === dateTo.getFullYear() && m === dateTo.getMonth()+1) {
				var i = tds.length , n = dateTo.getDate() ;
				while(i--){
					if(tds.eq(i).data('date') === n)  break ;
				}
				return tds.eq(i) ;
			}
			else return $(" ");
		} ,
		getTDweekly : function(date){
			var td = this.getTDByDate(date) ;
			if(td.length){
				var tdArr = td.parent().find("td.TdOut") ;
				return tdArr.not(function(i){
					return (tdArr.eq(i).html() === "&nbsp;") ;
				}) ;
			}
			else return  $(" ") ;
		} ,
		getTDmonthly : function(day){
			var date = (typeof day === "string" ? fy.parseDate(day) : day) ,
				m = this.selectedMonth ,
				y = this.selectedYear ;
			if(!day || y === date.getFullYear() && m === date.getMonth()+1)  return this.dateTds ;
			else return  $(" ") ;
		} ,
		getTDByDateMonthly : function(d){
			var x = parseInt(d, 10)||1 ;
			return this.dateTds.eq(--x) ;
		} ,
		getTDByDateYearly : function(month , date){
			var m = parseInt(month,10)||0 , d = parseInt(date,10)||1  ;
			if(this.selectedMonth === m) {
				return this.getTDByDate( new Date(this.selectedYear , (m-1) , d) ) ;
			}
			else return $(" ") ;
		} ,
		getFirstDateOfMonth : function(ye , mo){
			var y = ye || this.selectedYear , m = mo || this.selectedMonth ;
			return new Date(y , m-1 , 1) ;
		} ,
		getLastDateOfMonth : function(ye , mo){
			var y = ye || this.selectedYear , m = mo || this.selectedMonth ;
			return new Date(y , m , 0) ;
		} ,
		getTDBetween : function(date1 , date2){
			var d1 = (date1 instanceof Date ? date1 : fy.parseDate(date1) ) ;
			var d2 = (date2 instanceof Date ? date2 : fy.parseDate(date2) ) ;

			var from = this.getFirstDateOfMonth() , to = this.getLastDateOfMonth() ;

			var $tds = [] ;

			if( (from >= d1 && from <= d2) || (to >= d1 && to <= d2) ) {
				var that = this ;
				this.dateTds.each(function(i , td){
					var d = new Date(that.selectedYear , that.selectedMonth-1 , $(td).data("date") ) ;
					if(d >= d1 && d <= d2) $tds.push(td) ;
				}) ;
			}

			return $($tds) ;
		}
	};

	fy.register("dateChooser", DateChooser, "DisplayObject");

})(window, jQuery, fy);