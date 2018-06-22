(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.myModule= f()}})(function(){var define,module,exports;
'use strict';

// Constants


///////////////////////
///      UTILS      ///
///////////////////////



///////////////////////
///   SUPER CLASS   ///
///////////////////////

function Super () {};



///////////////////////
///   THE NIPPLE    ///
///////////////////////

function Nipple (collection, options) {
    this.identifier = options.identifier;
    this.position = options.position;
    this.frontPosition = options.frontPosition;
    this.collection = collection;

    // Defaults
    this.defaults = {
        size: 100,
        threshold: 0.1,
        color: 'white',
        fadeTime: 250,
        dataOnly: false,
        restJoystick: true,
        restOpacity: 0.5,
        mode: 'dynamic',
        zone: document.body,
        lockX: false,
        lockY: false
    };

    this.config(options);

    // Overwrites
    if (this.options.mode === 'dynamic') {
        this.options.restOpacity = 0;
    }

    this.id = Nipple.id;
    Nipple.id += 1;
    this.buildEl()
        .stylize();

    // Nipple's API.
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
    };

    return this.instance;
};

Nipple.prototype = new Super();
Nipple.constructor = Nipple;
Nipple.id = 0;


Nipple.prototype.computeDirection = function (obj) {
   
};

/* global Nipple, Super */

///////////////////////////
///   THE COLLECTION    ///
///////////////////////////

function Collection (manager, options) {
   
}

Collection.prototype = new Super();
Collection.constructor = Collection;
Collection.id = 0;

Collection.prototype.prepareNipples = function () {

};


/* global u, Super, Collection */

///////////////////////
///     MANAGER     ///
///////////////////////

function Manager (options) {
    var self = this;


    return self.collections;
};

Manager.prototype = new Super();
Manager.constructor = Manager;

Manager.prototype.create = function (options) {
    return this.createCollection(options);
};


/* 
 * 这里返回一个闭包对象,包含了导出的函数接口 
 * 在最前面声明了默认的对象为myModule
 * 模块外调用为 myModule.create 
 */

///////////////////////
///     export     ///
///////////////////////
var factory = new Manager();
return {
    create: function (options) {
        return factory.create(options);
    },
    factory: factory
};

});
