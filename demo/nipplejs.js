!function(t) {
    if ("object" == typeof exports && "undefined" != typeof module)
        module.exports = t();
    else if ("function" == typeof define && define.amd)
        define([], t);
    else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).nipplejs = t()
    }
}(function() {
    var t, i = !!("ontouchstart"in window), e = !!window.PointerEvent, n = !!window.MSPointerEvent, o = {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup"
    }, s = {};
    e ? t = {
        start: "pointerdown",
        move: "pointermove",
        end: "pointerup"
    } : n ? t = {
        start: "MSPointerDown",
        move: "MSPointerMove",
        end: "MSPointerUp"
    } : i ? (t = {
        start: "touchstart",
        move: "touchmove",
        end: "touchend, touchcancel"
    },
    s = o) : t = o;
    var r = {};
    function d() {}
    function a(t, i) {
        return this.identifier = i.identifier,
        this.position = i.position,
        this.frontPosition = i.frontPosition,
        this.collection = t,
        this.defaults = {
            size: 100,
            threshold: .1,
            color: "white",
            fadeTime: 250,
            dataOnly: !1,
            restJoystick: !0,
            restOpacity: .5,
            mode: "dynamic",
            zone: document.body
        },
        this.config(i),
        "dynamic" === this.options.mode && (this.options.restOpacity = 0),
        this.id = a.id,
        a.id += 1,
        this.buildEl().stylize(),
        this.instance = {
            el: this.ui.el,
            on: this.on.bind(this),
            off: this.off.bind(this),
            show: this.show.bind(this),
            hide: this.hide.bind(this),
            add: this.addToDom.bind(this),
            remove: this.removeFromDom.bind(this),
            destroy: this.destroy.bind(this),
            resetDirection: this.resetDirection.bind(this),
            computeDirection: this.computeDirection.bind(this),
            trigger: this.trigger.bind(this),
            position: this.position,
            frontPosition: this.frontPosition,
            ui: this.ui,
            identifier: this.identifier,
            id: this.id,
            options: this.options
        },
        this.instance
    }
    function p(t, i) {
        return this.nipples = [],
        this.idles = [],
        this.actives = [],
        this.ids = [],
        this.pressureIntervals = {},
        this.manager = t,
        this.id = p.id,
        p.id += 1,
        this.defaults = {
            zone: document.body,
            multitouch: !1,
            maxNumberOfNipples: 10,
            mode: "dynamic",
            position: {
                top: 0,
                left: 0
            },
            catchDistance: 200,
            size: 100,
            threshold: .1,
            color: "white",
            fadeTime: 250,
            dataOnly: !1,
            restJoystick: !0,
            restOpacity: .5
        },
        this.config(i),
        "static" !== this.options.mode && "semi" !== this.options.mode || (this.options.multitouch = !1),
        this.options.multitouch || (this.options.maxNumberOfNipples = 1),
        this.updateBox(),
        this.prepareNipples(),
        this.bindings(),
        this.begin(),
        this.nipples
    }
    function h(t) {
        var i, e = this;
        return e.ids = {},
        e.index = 0,
        e.collections = [],
        e.config(t),
        e.prepareCollections(),
        r.bindEvt(window, "resize", function(t) {
            clearTimeout(i),
            i = setTimeout(function() {
                var t, i = r.getScroll();
                e.collections.forEach(function(e) {
                    e.forEach(function(e) {
                        t = e.el.getBoundingClientRect(),
                        e.position = {
                            x: i.x + t.left,
                            y: i.y + t.top
                        }
                    })
                })
            }, 100)
        }),
        e.collections
    }
    r.distance = function(t, i) {
        var e = i.x - t.x
          , n = i.y - t.y;
        return Math.sqrt(e * e + n * n)
    }
    ,
    r.angle = function(t, i) {
        var e = i.x - t.x
          , n = i.y - t.y;
        return r.degrees(Math.atan2(n, e))
    }
    ,
    r.findCoord = function(t, i, e) {
        var n = {
            x: 0,
            y: 0
        };
        return e = r.radians(e),
        n.x = t.x - i * Math.cos(e),
        n.y = t.y - i * Math.sin(e),
        n
    }
    ,
    r.radians = function(t) {
        return t * (Math.PI / 180)
    }
    ,
    r.degrees = function(t) {
        return t * (180 / Math.PI)
    }
    ,
    r.bindEvt = function(t, i, e) {
        for (var n, o = i.split(/[ ,]+/g), s = 0; s < o.length; s += 1)
            n = o[s],
            t.addEventListener ? t.addEventListener(n, e, !1) : t.attachEvent && t.attachEvent(n, e)
    }
    ,
    r.unbindEvt = function(t, i, e) {
        for (var n, o = i.split(/[ ,]+/g), s = 0; s < o.length; s += 1)
            n = o[s],
            t.removeEventListener ? t.removeEventListener(n, e) : t.detachEvent && t.detachEvent(n, e)
    }
    ,
    r.trigger = function(t, i, e) {
        var n = new CustomEvent(i,e);
        t.dispatchEvent(n)
    }
    ,
    r.prepareEvent = function(t) {
        return t.preventDefault(),
        t.type.match(/^touch/) ? t.changedTouches : t
    }
    ,
    r.getScroll = function() {
        return {
            x: void 0 !== window.pageXOffset ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            y: void 0 !== window.pageYOffset ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
        }
    }
    ,
    r.applyPosition = function(t, i) {
        i.x && i.y ? (t.style.left = i.x + "px",
        t.style.top = i.y + "px") : (i.top || i.right || i.bottom || i.left) && (t.style.top = i.top,
        t.style.right = i.right,
        t.style.bottom = i.bottom,
        t.style.left = i.left)
    }
    ,
    r.getTransitionStyle = function(t, i, e) {
        var n = r.configStylePropertyObject(t);
        for (var o in n)
            if (n.hasOwnProperty(o))
                if ("string" == typeof i)
                    n[o] = i + " " + e;
                else {
                    for (var s = "", d = 0, a = i.length; d < a; d += 1)
                        s += i[d] + " " + e + ", ";
                    n[o] = s.slice(0, -2)
                }
        return n
    }
    ,
    r.getVendorStyle = function(t, i) {
        var e = r.configStylePropertyObject(t);
        for (var n in e)
            e.hasOwnProperty(n) && (e[n] = i);
        return e
    }
    ,
    r.configStylePropertyObject = function(t) {
        var i = {};
        i[t] = "";
        return ["webkit", "Moz", "o"].forEach(function(e) {
            i[e + t.charAt(0).toUpperCase() + t.slice(1)] = ""
        }),
        i
    }
    ,
    r.extend = function(t, i) {
        for (var e in i)
            i.hasOwnProperty(e) && (t[e] = i[e]);
        return t
    }
    ,
    r.safeExtend = function(t, i) {
        var e = {};
        for (var n in t)
            t.hasOwnProperty(n) && i.hasOwnProperty(n) ? e[n] = i[n] : t.hasOwnProperty(n) && (e[n] = t[n]);
        return e
    }
    ,
    r.map = function(t, i) {
        if (t.length)
            for (var e = 0, n = t.length; e < n; e += 1)
                i(t[e]);
        else
            i(t)
    }
    ,
    d.prototype.on = function(t, i) {
        var e, n = t.split(/[ ,]+/g);
        this._handlers_ = this._handlers_ || {};
        for (var o = 0; o < n.length; o += 1)
            e = n[o],
            this._handlers_[e] = this._handlers_[e] || [],
            this._handlers_[e].push(i);
        return this
    }
    ,
    d.prototype.off = function(t, i) {
        return this._handlers_ = this._handlers_ || {},
        void 0 === t ? this._handlers_ = {} : void 0 === i ? this._handlers_[t] = null : this._handlers_[t] && this._handlers_[t].indexOf(i) >= 0 && this._handlers_[t].splice(this._handlers_[t].indexOf(i), 1),
        this
    }
    ,
    d.prototype.trigger = function(t, i) {
        var e, n = this, o = t.split(/[ ,]+/g);
        n._handlers_ = n._handlers_ || {};
        for (var s = 0; s < o.length; s += 1)
            e = o[s],
            n._handlers_[e] && n._handlers_[e].length && n._handlers_[e].forEach(function(t) {
                t.call(n, {
                    type: e,
                    target: n
                }, i)
            })
    }
    ,
    d.prototype.config = function(t) {
        this.options = this.defaults || {},
        t && (this.options = r.safeExtend(this.options, t))
    }
    ,
    d.prototype.bindEvt = function(i, e) {
        var n = this;
        return n._domHandlers_ = n._domHandlers_ || {},
        n._domHandlers_[e] = function() {
            "function" == typeof n["on" + e] ? n["on" + e].apply(n, arguments) : console.warn('[WARNING] : Missing "on' + e + '" handler.')
        }
        ,
        r.bindEvt(i, t[e], n._domHandlers_[e]),
        s[e] && r.bindEvt(i, s[e], n._domHandlers_[e]),
        n
    }
    ,
    d.prototype.unbindEvt = function(i, e) {
        return this._domHandlers_ = this._domHandlers_ || {},
        r.unbindEvt(i, t[e], this._domHandlers_[e]),
        s[e] && r.unbindEvt(i, s[e], this._domHandlers_[e]),
        delete this._domHandlers_[e],
        this
    }
    ,
    a.prototype = new d,
    a.constructor = a,
    a.id = 0,
    a.prototype.buildEl = function(t) {
        return this.ui = {},
        this.options.dataOnly ? this : (this.ui.el = document.createElement("div"),
        this.ui.back = document.createElement("div"),
        this.ui.front = document.createElement("div"),
        this.ui.el.className = "nipple collection_" + this.collection.id,
        this.ui.back.className = "back",
        this.ui.front.className = "front",
        this.ui.el.setAttribute("id", "nipple_" + this.collection.id + "_" + this.id),
        this.ui.el.appendChild(this.ui.back),
        this.ui.el.appendChild(this.ui.front),
        this)
    }
    ,
    a.prototype.stylize = function() {
        if (this.options.dataOnly)
            return this;
        var t = this.options.fadeTime + "ms"
          , i = r.getVendorStyle("borderRadius", "50%")
          , e = r.getTransitionStyle("transition", "opacity", t)
          , n = {};
        return n.el = {
            position: "absolute",
            opacity: this.options.restOpacity,
            display: "block",
            zIndex: 999
        },
        n.back = {
            position: "absolute",
            display: "block",
            width: this.options.size + "px",
            height: this.options.size + "px",
            marginLeft: -this.options.size / 2 + "px",
            marginTop: -this.options.size / 2 + "px",
            background: this.options.color,
            opacity: ".5"
        },
        n.front = {
            width: this.options.size / 1.5 + "px",
            height: this.options.size / 1.5 + "px",
            position: "absolute",
            display: "block",
            marginLeft: -this.options.size / 3 + "px",
            marginTop: -this.options.size / 3 + "px",
            background: this.options.color,
            opacity: ".5"
        },
        r.extend(n.el, e),
        r.extend(n.back, i),
        r.extend(n.front, i),
        this.applyStyles(n),
        this
    }
    ,
    a.prototype.applyStyles = function(t) {
        for (var i in this.ui)
            if (this.ui.hasOwnProperty(i))
                for (var e in t[i])
                    this.ui[i].style[e] = t[i][e];
        return this
    }
    ,
    a.prototype.addToDom = function() {
        return this.options.dataOnly || document.body.contains(this.ui.el) ? this : (this.options.zone.appendChild(this.ui.el),
        this)
    }
    ,
    a.prototype.removeFromDom = function() {
        return this.options.dataOnly || !document.body.contains(this.ui.el) ? this : (this.options.zone.removeChild(this.ui.el),
        this)
    }
    ,
    a.prototype.destroy = function() {
        clearTimeout(this.removeTimeout),
        clearTimeout(this.showTimeout),
        clearTimeout(this.restTimeout),
        this.trigger("destroyed", this.instance),
        this.removeFromDom(),
        this.off()
    }
    ,
    a.prototype.show = function(t) {
        var i = this;
        return i.options.dataOnly ? i : (clearTimeout(i.removeTimeout),
        clearTimeout(i.showTimeout),
        clearTimeout(i.restTimeout),
        i.addToDom(),
        i.restCallback(),
        setTimeout(function() {
            i.ui.el.style.opacity = 1
        }, 0),
        i.showTimeout = setTimeout(function() {
            i.trigger("shown", i.instance),
            "function" == typeof t && t.call(this)
        }, i.options.fadeTime),
        i)
    }
    ,
    a.prototype.hide = function(t) {
        var i = this;
        return i.options.dataOnly ? i : (i.ui.el.style.opacity = i.options.restOpacity,
        clearTimeout(i.removeTimeout),
        clearTimeout(i.showTimeout),
        clearTimeout(i.restTimeout),
        i.removeTimeout = setTimeout(function() {
            var e = "dynamic" === i.options.mode ? "none" : "block";
            i.ui.el.style.display = e,
            "function" == typeof t && t.call(i),
            i.trigger("hidden", i.instance)
        }, i.options.fadeTime),
        i.options.restJoystick && i.restPosition(),
        i)
    }
    ,
    a.prototype.restPosition = function(t) {
        var i = this;
        i.frontPosition = {
            x: 0,
            y: 0
        };
        var e = i.options.fadeTime + "ms"
          , n = {};
        n.front = r.getTransitionStyle("transition", ["top", "left"], e);
        var o = {
            front: {}
        };
        o.front = {
            left: i.frontPosition.x + "px",
            top: i.frontPosition.y + "px"
        },
        i.applyStyles(n),
        i.applyStyles(o),
        i.restTimeout = setTimeout(function() {
            "function" == typeof t && t.call(i),
            i.restCallback()
        }, i.options.fadeTime)
    }
    ,
    a.prototype.restCallback = function() {
        var t = {};
        t.front = r.getTransitionStyle("transition", "none", ""),
        this.applyStyles(t),
        this.trigger("rested", this.instance)
    }
    ,
    a.prototype.resetDirection = function() {
        this.direction = {
            x: !1,
            y: !1,
            angle: !1
        }
    }
    ,
    a.prototype.computeDirection = function(t) {
        var i, e, n, o = t.angle.radian, s = Math.PI / 4, r = Math.PI / 2;
        if (i = o > s && o < 3 * s ? "up" : o > -s && o <= s ? "left" : o > 3 * -s && o <= -s ? "down" : "right",
        e = o > -r && o < r ? "left" : "right",
        n = o > 0 ? "up" : "down",
        t.force > this.options.threshold) {
            var d = {};
            for (var a in this.direction)
                this.direction.hasOwnProperty(a) && (d[a] = this.direction[a]);
            var p = {};
            for (var a in this.direction = {
                x: e,
                y: n,
                angle: i
            },
            t.direction = this.direction,
            d)
                d[a] === this.direction[a] && (p[a] = !0);
            if (p.x && p.y && p.angle)
                return t;
            p.x && p.y || this.trigger("plain", t),
            p.x || this.trigger("plain:" + e, t),
            p.y || this.trigger("plain:" + n, t),
            p.angle || this.trigger("dir dir:" + i, t)
        }
        return t
    }
    ,
    p.prototype = new d,
    p.constructor = p,
    p.id = 0,
    p.prototype.prepareNipples = function() {
        var t = this.nipples;
        t.on = this.on.bind(this),
        t.off = this.off.bind(this),
        t.options = this.options,
        t.destroy = this.destroy.bind(this),
        t.ids = this.ids,
        t.id = this.id,
        t.processOnMove = this.processOnMove.bind(this),
        t.processOnEnd = this.processOnEnd.bind(this),
        t.get = function(i) {
            if (void 0 === i)
                return t[0];
            for (var e = 0, n = t.length; e < n; e += 1)
                if (t[e].identifier === i)
                    return t[e];
            return !1
        }
    }
    ,
    p.prototype.bindings = function() {
        this.bindEvt(this.options.zone, "start"),
        this.options.zone.style.touchAction = "none",
        this.options.zone.style.msTouchAction = "none"
    }
    ,
    p.prototype.begin = function() {
        var t = this.options;
        if ("static" === t.mode) {
            var i = this.createNipple(t.position, this.manager.getIdentifier());
            i.add(),
            this.idles.push(i)
        }
    }
    ,
    p.prototype.createNipple = function(t, i) {
        var e = r.getScroll()
          , n = {}
          , o = this.options;
        if (t.x && t.y)
            n = {
                x: t.x - (e.x + this.box.left),
                y: t.y - (e.y + this.box.top)
            };
        else if (t.top || t.right || t.bottom || t.left) {
            var s = document.createElement("DIV");
            s.style.display = "hidden",
            s.style.top = t.top,
            s.style.right = t.right,
            s.style.bottom = t.bottom,
            s.style.left = t.left,
            s.style.position = "absolute",
            o.zone.appendChild(s);
            var d = s.getBoundingClientRect();
            o.zone.removeChild(s),
            n = t,
            t = {
                x: d.left + e.x,
                y: d.top + e.y
            }
        }
        var p = new a(this,{
            color: o.color,
            size: o.size,
            threshold: o.threshold,
            fadeTime: o.fadeTime,
            dataOnly: o.dataOnly,
            restJoystick: o.restJoystick,
            restOpacity: o.restOpacity,
            mode: o.mode,
            identifier: i,
            position: t,
            zone: o.zone,
            frontPosition: {
                x: 0,
                y: 0
            }
        });
        return o.dataOnly || (r.applyPosition(p.ui.el, n),
        r.applyPosition(p.ui.front, p.frontPosition)),
        this.nipples.push(p),
        this.trigger("added " + p.identifier + ":added", p),
        this.manager.trigger("added " + p.identifier + ":added", p),
        this.bindNipple(p),
        p
    }
    ,
    p.prototype.updateBox = function() {
        this.box = this.options.zone.getBoundingClientRect()
    }
    ,
    p.prototype.bindNipple = function(t) {
        var i, e = this, n = function(t, n) {
            i = t.type + " " + n.id + ":" + t.type,
            e.trigger(i, n)
        };
        t.on("destroyed", e.onDestroyed.bind(e)),
        t.on("shown hidden rested dir plain", n),
        t.on("dir:up dir:right dir:down dir:left", n),
        t.on("plain:up plain:right plain:down plain:left", n)
    }
    ,
    p.prototype.pressureFn = function(t, i, e) {
        var n = this
          , o = 0;
        clearInterval(n.pressureIntervals[e]),
        n.pressureIntervals[e] = setInterval(function() {
            var e = t.force || t.pressure || t.webkitForce || 0;
            e !== o && (i.trigger("pressure", e),
            n.trigger("pressure " + i.identifier + ":pressure", e),
            o = e)
        }
        .bind(n), 100)
    }
    ,
    p.prototype.onstart = function(t) {
        var i = this
          , e = i.options;
        t = r.prepareEvent(t),
        i.updateBox();
        return r.map(t, function(t) {
            i.actives.length < e.maxNumberOfNipples && i.processOnStart(t)
        }),
        i.manager.bindDocument(),
        !1
    }
    ,
    p.prototype.processOnStart = function(t) {
        var i, e = this, n = e.options, o = e.manager.getIdentifier(t), s = t.force || t.pressure || t.webkitForce || 0, d = {
            x: t.pageX,
            y: t.pageY
        }, a = e.getOrCreate(o, d);
        a.identifier !== o && e.manager.removeIdentifier(a.identifier),
        a.identifier = o;
        var p = function(i) {
            i.trigger("start", i),
            e.trigger("start " + i.id + ":start", i),
            i.show(),
            s > 0 && e.pressureFn(t, i, i.identifier),
            e.processOnMove(t)
        };
        if ((i = e.idles.indexOf(a)) >= 0 && e.idles.splice(i, 1),
        e.actives.push(a),
        e.ids.push(a.identifier),
        "semi" !== n.mode)
            p(a);
        else {
            if (!(r.distance(d, a.position) <= n.catchDistance))
                return a.destroy(),
                void e.processOnStart(t);
            p(a)
        }
        return a
    }
    ,
    p.prototype.getOrCreate = function(t, i) {
        var e, n = this.options;
        return /(semi|static)/.test(n.mode) ? (e = this.idles[0]) ? (this.idles.splice(0, 1),
        e) : "semi" === n.mode ? this.createNipple(i, t) : (console.warn("Coudln't find the needed nipple."),
        !1) : e = this.createNipple(i, t)
    }
    ,
    p.prototype.processOnMove = function(t) {
        var i = this.options
          , e = this.manager.getIdentifier(t)
          , n = this.nipples.get(e);
        if (!n)
            return console.error("Found zombie joystick with ID " + e),
            void this.manager.removeIdentifier(e);
        n.identifier = e;
        var o = n.options.size / 2
          , s = {
            x: t.pageX,
            y: t.pageY
        }
          , d = r.distance(s, n.position)
          , a = r.angle(s, n.position)
          , p = r.radians(a)
          , h = d / o;
        d > o && (d = o,
        s = r.findCoord(n.position, d, a)),
        n.frontPosition = {
            x: s.x - n.position.x,
            y: s.y - n.position.y
        },
        i.dataOnly || r.applyPosition(n.ui.front, n.frontPosition);
        var c = {
            identifier: n.identifier,
            position: s,
            force: h,
            pressure: t.force || t.pressure || t.webkitForce || 0,
            distance: d,
            angle: {
                radian: p,
                degree: a
            },
            instance: n
        };
        (c = n.computeDirection(c)).angle = {
            radian: r.radians(180 - a),
            degree: 180 - a
        },
        n.trigger("move", c),
        this.trigger("move " + n.id + ":move", c)
    }
    ,
    p.prototype.processOnEnd = function(t) {
        var i = this
          , e = i.options
          , n = i.manager.getIdentifier(t)
          , o = i.nipples.get(n)
          , s = i.manager.removeIdentifier(o.identifier);
        o && (e.dataOnly || o.hide(function() {
            "dynamic" === e.mode && (o.trigger("removed", o),
            i.trigger("removed " + o.id + ":removed", o),
            i.manager.trigger("removed " + o.id + ":removed", o),
            o.destroy())
        }),
        clearInterval(i.pressureIntervals[o.identifier]),
        o.resetDirection(),
        o.trigger("end", o),
        i.trigger("end " + o.id + ":end", o),
        i.ids.indexOf(o.identifier) >= 0 && i.ids.splice(i.ids.indexOf(o.identifier), 1),
        i.actives.indexOf(o) >= 0 && i.actives.splice(i.actives.indexOf(o), 1),
        /(semi|static)/.test(e.mode) ? i.idles.push(o) : i.nipples.indexOf(o) >= 0 && i.nipples.splice(i.nipples.indexOf(o), 1),
        i.manager.unbindDocument(),
        /(semi|static)/.test(e.mode) && (i.manager.ids[s.id] = s.identifier))
    }
    ,
    p.prototype.onDestroyed = function(t, i) {
        this.nipples.indexOf(i) >= 0 && this.nipples.splice(this.nipples.indexOf(i), 1),
        this.actives.indexOf(i) >= 0 && this.actives.splice(this.actives.indexOf(i), 1),
        this.idles.indexOf(i) >= 0 && this.idles.splice(this.idles.indexOf(i), 1),
        this.ids.indexOf(i.identifier) >= 0 && this.ids.splice(this.ids.indexOf(i.identifier), 1),
        this.manager.removeIdentifier(i.identifier),
        this.manager.unbindDocument()
    }
    ,
    p.prototype.destroy = function() {
        for (var t in this.unbindEvt(this.options.zone, "start"),
        this.nipples.forEach(function(t) {
            t.destroy()
        }),
        this.pressureIntervals)
            this.pressureIntervals.hasOwnProperty(t) && clearInterval(this.pressureIntervals[t]);
        this.trigger("destroyed", this.nipples),
        this.manager.unbindDocument(),
        this.off()
    }
    ,
    h.prototype = new d,
    h.constructor = h,
    h.prototype.prepareCollections = function() {
        var t = this;
        t.collections.create = t.create.bind(t),
        t.collections.on = t.on.bind(t),
        t.collections.off = t.off.bind(t),
        t.collections.destroy = t.destroy.bind(t),
        t.collections.get = function(i) {
            var e;
            return t.collections.every(function(t) {
                return !(e = t.get(i))
            }),
            e
        }
    }
    ,
    h.prototype.create = function(t) {
        return this.createCollection(t)
    }
    ,
    h.prototype.createCollection = function(t) {
        var i = new p(this,t);
        return this.bindCollection(i),
        this.collections.push(i),
        i
    }
    ,
    h.prototype.bindCollection = function(t) {
        var i, e = this, n = function(t, n) {
            i = t.type + " " + n.id + ":" + t.type,
            e.trigger(i, n)
        };
        t.on("destroyed", e.onDestroyed.bind(e)),
        t.on("shown hidden rested dir plain", n),
        t.on("dir:up dir:right dir:down dir:left", n),
        t.on("plain:up plain:right plain:down plain:left", n)
    }
    ,
    h.prototype.bindDocument = function() {
        this.binded || (this.bindEvt(document, "move").bindEvt(document, "end"),
        this.binded = !0)
    }
    ,
    h.prototype.unbindDocument = function(t) {
        Object.keys(this.ids).length && !0 !== t || (this.unbindEvt(document, "move").unbindEvt(document, "end"),
        this.binded = !1)
    }
    ,
    h.prototype.getIdentifier = function(t) {
        var i;
        return t ? void 0 === (i = void 0 === t.identifier ? t.pointerId : t.identifier) && (i = this.latest || 0) : i = this.index,
        void 0 === this.ids[i] && (this.ids[i] = this.index,
        this.index += 1),
        this.latest = i,
        this.ids[i]
    }
    ,
    h.prototype.removeIdentifier = function(t) {
        var i = {};
        for (var e in this.ids)
            if (this.ids[e] === t) {
                i.id = e,
                i.identifier = this.ids[e],
                delete this.ids[e];
                break
            }
        return i
    }
    ,
    h.prototype.onmove = function(t) {
        return this.onAny("move", t),
        !1
    }
    ,
    h.prototype.onend = function(t) {
        return this.onAny("end", t),
        !1
    }
    ,
    h.prototype.onAny = function(t, i) {
        var e, n = this, o = "processOn" + t.charAt(0).toUpperCase() + t.slice(1);
        i = r.prepareEvent(i);
        return r.map(i, function(t) {
            e = n.getIdentifier(t),
            r.map(n.collections, function(t, i, e) {
                e.ids.indexOf(i) >= 0 && (e[o](t),
                t._found_ = !0)
            }
            .bind(null, t, e)),
            t._found_ || n.removeIdentifier(e)
        }),
        !1
    }
    ,
    h.prototype.destroy = function() {
        this.unbindDocument(!0),
        this.ids = {},
        this.index = 0,
        this.collections.forEach(function(t) {
            t.destroy()
        }),
        this.off()
    }
    ,
    h.prototype.onDestroyed = function(t, i) {
        if (this.collections.indexOf(i) < 0)
            return !1;
        this.collections.splice(this.collections.indexOf(i), 1)
    }
    ;
    var c = new h;
    return {
        create: function(t) {
            return c.create(t)
        },
        factory: c
    }
});
