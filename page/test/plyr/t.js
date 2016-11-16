"document" in self && ("classList" in document.createElement("_") ? !function () {
	"use strict";
	var e = document.createElement("_");
	if (e.classList.add("c1", "c2"), !e.classList.contains("c2")) {
		var t = function (e) {
			var t = DOMTokenList.prototype[e];
			DOMTokenList.prototype[e] = function (e) {
				var i, s = arguments.length;
				for (i = 0; i < s; i++)e = arguments[i], t.call(this, e)
			}
		};
		t("add"), t("remove")
	}
	if (e.classList.toggle("c3", !1), e.classList.contains("c3")) {
		var i = DOMTokenList.prototype.toggle;
		DOMTokenList.prototype.toggle = function (e, t) {
			return 1 in arguments && !this.contains(e) == !t ? t : i.call(this, e)
		}
	}
	e = null
}() : !function (e) {
	"use strict";
	if ("Element" in e) {
		var t = "classList", i = "prototype", s = e.Element[i], o = Object, n = String[i].trim || function () {
				return this.replace(/^\s+|\s+$/g, "")
			}, r = Array[i].indexOf || function (e) {
				for (var t = 0, i = this.length; t < i; t++)if (t in this && this[t] === e)return t;
				return -1
			}, a = function (e, t) {
			this.name = e, this.code = DOMException[e], this.message = t
		}, c = function (e, t) {
			if ("" === t)throw new a("SYNTAX_ERR", "An invalid or illegal string was specified");
			if (/\s/.test(t))throw new a("INVALID_CHARACTER_ERR", "String contains an invalid character");
			return r.call(e, t)
		}, l = function (e) {
			for (var t = n.call(e.getAttribute("class") || ""), i = t ? t.split(/\s+/) : [], s = 0, o = i.length; s < o; s++)this.push(i[s]);
			this._updateClassName = function () {
				e.setAttribute("class", this.toString())
			}
		}, u = l[i] = [], d = function () {
			return new l(this)
		};
		if (a[i] = Error[i], u.item = function (e) {
				return this[e] || null
			}, u.contains = function (e) {
				return e += "", c(this, e) !== -1
			}, u.add = function () {
				var e, t = arguments, i = 0, s = t.length, o = !1;
				do e = t[i] + "", c(this, e) === -1 && (this.push(e), o = !0); while (++i < s);
				o && this._updateClassName()
			}, u.remove = function () {
				var e, t, i = arguments, s = 0, o = i.length, n = !1;
				do for (e = i[s] + "", t = c(this, e); t !== -1;)this.splice(t, 1), n = !0, t = c(this, e); while (++s < o);
				n && this._updateClassName()
			}, u.toggle = function (e, t) {
				e += "";
				var i = this.contains(e), s = i ? t !== !0 && "remove" : t !== !1 && "add";
				return s && this[s](e), t === !0 || t === !1 ? t : !i
			}, u.toString = function () {
				return this.join(" ")
			}, o.defineProperty) {
			var p = {get: d, enumerable: !0, configurable: !0};
			try {
				o.defineProperty(s, t, p)
			} catch (e) {
				e.number === -2146823252 && (p.enumerable = !1, o.defineProperty(s, t, p))
			}
		} else o[i].__defineGetter__ && s.__defineGetter__(t, d)
	}
}(self)), function () {
	function e(e, t, i) {
		if (e)if (e.classList)e.classList[i ? "add" : "remove"](t); else {
			var s = (" " + e.className + " ").replace(/\s+/g, " ").replace(" " + t + " ", "");
			e.className = s + (i ? " " + t : "")
		}
	}

	function t(t, i) {
		if (t in n && (i || t !== r) && (r.length || t !== n.video)) {
			switch (t) {
				case n.video:
					s.source({
						type: "video",
						title: "View From A Blue Moon",
						sources: [{
							src: "https://cdn.selz.com/plyr/1.5/View_From_A_Blue_Moon_Trailer-HD.mp4",
							type: "video/mp4"
						}, {
							src: "https://cdn.selz.com/plyr/1.5/View_From_A_Blue_Moon_Trailer-HD.webm",
							type: "video/webm"
						}],
						poster: "https://cdn.selz.com/plyr/1.5/View_From_A_Blue_Moon_Trailer-HD.jpg",
						tracks: [{
							kind: "captions",
							label: "English",
							srclang: "en",
							src: "https://cdn.selz.com/plyr/1.5/View_From_A_Blue_Moon_Trailer-HD.en.vtt",
							default: !0
						}]
					});
					break;
				case n.audio:
					s.source({
						type: "audio",
						title: "Kishi Bashi &ndash; &ldquo;It All Began With A Burst&rdquo;",
						sources: [{
							src: "https://cdn.selz.com/plyr/1.5/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3",
							type: "audio/mp3"
						}, {
							src: "https://cdn.selz.com/plyr/1.5/Kishi_Bashi_-_It_All_Began_With_a_Burst.ogg",
							type: "audio/ogg"
						}]
					});
					break;
				case n.youtube:
					s.source({
						type: "video",
						title: "View From A Blue Moon",
						sources: [{src: "bTqVqk7FSmY", type: "youtube"}]
					});
					break;
				case n.vimeo:
					s.source({
						type: "video",
						title: "View From A Blue Moon",
						sources: [{src: "143418951", type: "vimeo"}]
					})
			}
			r = t;
			for (var a = o.length - 1; a >= 0; a--)e(o[a].parentElement, "active", !1);
			e(document.querySelector('[data-source="' + t + '"]').parentElement, "active", !0)
		}
	}

	var i = plyr.setup({
		debug: !0,
		title: "Video demo",
		iconUrl: "https://cdn.plyr.io/2.0.10/plyr.svg",
		tooltips: {controls: !0},
		captions: {defaultActive: !0}
	});
	plyr.loadSprite("https://cdn.plyr.io/2.0.10/demo.svg");
	for (var s = i[0], o = document.querySelectorAll("[data-source]"), n = {
		video: "video",
		audio: "audio",
		youtube: "youtube",
		vimeo: "vimeo"
	}, r = window.location.hash.replace("#", ""), a = window.history && window.history.pushState, c = o.length - 1; c >= 0; c--)o[c].addEventListener("click", function () {
		var e = this.getAttribute("data-source");
		t(e), a && history.pushState({type: e}, "", "#" + e)
	});
	if (window.addEventListener("popstate", function (e) {
			e.state && "type" in e.state && t(e.state.type)
		}), a) {
		var l = !r.length;
		l && (r = n.video), r in n && history.replaceState({type: r}, "", l ? "" : "#" + r), r !== n.video && t(r, !0)
	}
}(), document.domain.indexOf("plyr.io") > -1 && (!function (e, t, i, s, o, n, r) {
	e.GoogleAnalyticsObject = o, e[o] = e[o] || function () {
			(e[o].q = e[o].q || []).push(arguments)
		}, e[o].l = 1 * new Date, n = t.createElement(i), r = t.getElementsByTagName(i)[0], n.async = 1, n.src = s, r.parentNode.insertBefore(n, r)
}(window, document, "script", "//www.google-analytics.com/analytics.js", "ga"), ga("create", "UA-40881672-11", "auto"), ga("send", "pageview"));