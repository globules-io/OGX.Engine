OGX.Object = class {
     #register;
     #uxis;

     constructor() {
          this.#register = new OGX.List();
          this.#uxis = new OGX.List();
          this.#uxis.cache('_NAME_', 'id');
     }

     getExtend(__cls) {
          let reg = this.#register.get({ main: { eq: __cls } }, 1);
          if (reg) {
               return reg.extends;
          }
          return false;
     }

     getExtends(__cls) {
          let arr = [];
          let reg = this.#register.get({ main: { eq: __cls } }, 1);
          if (reg) {
               arr = arr.concat(reg.extends);
               let r;
               for (let i = 0; i < reg.extends.length; i++) {
                    r = this.getExtends(reg.extends[i]);
                    if (r) {
                         arr = arr.concat(r);
                    }
               }
          }
          let final = [];
          for (let i = 0; i < arr.length; i++) {
               if (!final.includes(arr[i])) {
                    final.push(arr[i]);
               }
          }
          return final;
     }

     register() {
          const args = Array.prototype.slice.call(arguments);
          const main = args.shift();
          this.#register.push({ main: main, extends: args });
     }

     create(__cls, __config) {
          const ext = this.getExtends(__cls);
          if (ext.length) {
               return this.#assemble(__cls, __config, ext);
          }
          return new OGX[__cls](__config);
     }

     #assemble(__cls, __config, __parents) {
          const instances = __parents.map((Parent) => {               
               return new OGX[Parent](__config);
          });
          __cls = __cls.split('.');
          let ref = OGX;
          for (const part of __cls) {
               ref = ref[part];
          }
          const instance = new ref(__config);
          instance._NAME_ = __cls;
          return new Proxy(instance, {
               get(target, prop) {
                    if (prop in target) {
                         return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
                    }
                    for (const instance of instances) {
                         if (prop in instance) {
                              return typeof instance[prop] === 'function' ? instance[prop].bind(instance) : instance[prop];
                         }
                    }
                    return target[prop];
               },
          });
     }

     cache(__instance) {
          if (typeof __instance === 'undefined') {
               return uxis;
          }
          this.#uxis.insert(__instance);
     }

     uncache(__instance) {
          this.#uxis.findDelete('id', __instance.id);
     }

     get(__query, __sort, __limit) {
          return this.#uxis.get(__query, __sort, __limit);
     }

     destroy(__uxi, __clear) {
          if (typeof __clear === 'undefined') {
               __clear = true;
          }
          if (typeof __uxi.blur === 'function') {
               __uxi.blur();
          }
          if (typeof __uxi.destroy === 'function') {
               __uxi.destroy();
          }
          if (typeof __uxi.__destroy === 'function') {
               __uxi.__destroy();
          }
          if (__clear) {
               __uxi.clear();
          }
          if (__uxi.el) {
               __uxi.el.remove();
          }
          if (__uxi.parent) {
               __uxi.parent.nodes.findDelete('id', __uxi.id, 1);
          }
          this.#uxis.findDelete('id', __uxi.id, 1);
     }

     genId() {
          return 'u' + new Date().getTime() + '' + Math.round(Math.random() * 1000);
     }

     pathToObj(__string) {
          let path = __string.split('.');
          let o = OGX;
          for (let i = 0; i < path.length; i++) {
               if (typeof o[path[i]] !== 'undefined') {
                    o = o[path[i]];
               }
          }
          return o;
     }
};
OGX.Object = new OGX.Object();

function require() {
     OGX.Object.register.apply(OGX.Object, arguments);
}
