OGX.Events = class {

     #events = new OGX.List();

     constructor() {
         this.#listenWindow();
     }

     on(__event, __selector=null, __cb=()=>{}) {   
          arguments.length === 2 ? [__cb, __selector] = [__selector, false] : null;
          console.log(__event, __selector, __cb);
          let item = null;
          if ((item = this.#events.get({ event: __event }, 1))) {
               item.cbs.push({ sel: __selector, cb: __cb });
               return;
          }
          item = { event: __event, hear: null, cbs: new OGX.List({ sel: __selector, cb: __cb }) };
          item.hear = document.addEventListener(__event, this.#onEvent.bind(this));
          this.#events.insert(item);
     }

     off(__target, __event, __selector) {
          arguments.length === 2 ? [__cb, __selector] = [__selector, false] : null;
          const item = this.#events.get({ event: __event }, 1);
          if (item) {
               item.cbs.delete({ sel: __selector }, 1);
               if (!item.cbs.length) {
                    document.removeEventListener(__event, item.hear);
                    this.#events.delete({ event: __event }, 1);
               }
          }
     }

     trigger(__event, __data={}){
          OGX.DOM.trigger(document, __event, __data);
     }

     #onEvent(__e) {
          const item = this.#events.get({ event: __e.type }, 1);
          if (item) {               
               item.cbs.forEach((__obj) => {                
                    if (!__obj.sel || (__obj.sel && __e.target.closest(__obj.sel))) {
                         __obj.cb(__e);
                    }
               });
          }
     }

     #listenWindow(){
          const windowEvents = ['resize', 'scroll', 'popstate', 'hashchange', 'orientationchange', 'online', 'offline', 'message', 'beforeunload', 'unload', 'error', 'storage', 'focus', 'blur'];
          windowEvents.forEach((__event) => {
               window.addEventListener(__event, (__e) => {                    
                    if (__e.__redispatched) return;
                    const clonedEvent = new CustomEvent(__event, {
                         detail: __e,
                         bubbles: true,
                         cancelable: true,
                    });
                    clonedEvent.__redispatched = true;
                    document.dispatchEvent(clonedEvent);
               });
          });
     }
};
OGX.Events = new OGX.Events();
