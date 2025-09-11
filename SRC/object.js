OGX.Object = class {
     #register;
     #uxis;

     constructor() {
          this.#register = new OGX.List();
          this.#uxis = new OGX.List();
          this.#uxis.cache('_CLASS_', 'id');
     }

     genId() {
          return 'u' + new Date().getTime() + '' + Math.round(Math.random() * 1000);
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
          return this.#assemble(__cls, __config, ext);        
     }

     cache(__instance) {
          if (typeof __instance === 'undefined') {
               return uxis;
          }
          this.#uxis.insert(__instance);
     }

     uncache(__instance) {
          this.#uxis.delete({id: __instance.id});
     }

     get(__query, __sort, __limit) {
          return this.#uxis.get(__query, {sort: __sort, limit: __limit});
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
               __uxi.parent.nodes.delete({id: __uxi.id}, 1);
          }
          this.#uxis.delete({id: __uxi.id}, 1);
     }        

     #assemble(__cls, __config, __parents=[]) {
          const ref = this.#pathToReference(__cls);          
          const instance = new ref(__config);          
          if(!__parents.length){
               this.#pathToComposite(__cls, instance);  
               return instance;
          }      
          const instances = __parents.map((Parent) => {               
               return new OGX[Parent](__config);
          }); 
          const proxy = new Proxy(instance, {
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
          this.#pathToComposite(__cls, instance);  
          return proxy;
     }

     #pathToReference(__cls){
          let cls = __cls.split('.');
          let ref = OGX;
          for (const part of cls) {
               ref = ref[part];
          }
          return ref;
     }
     
     #pathToComposite(__path, __instance){
          if(__path.indexOf('.') === -1){
               __instance._NAME_ = '';               
               __instance._NAMESPACE_ = '';
               __instance._CLASS_ = __path;
          }else{
               let p = __path.split('.');
               __instance._NAME_ = p[1];               
               __instance._NAMESPACE_ = p[0];
               __instance._CLASS_ = p[0].slice(0, -1);
          }
     }     
};
OGX.Object = new OGX.Object();

function require() {
     OGX.Object.register.apply(OGX.Object, arguments);
}
