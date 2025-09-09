OGX.EventManager = class {

     #events = new OGX.List();

     on(__event, __selector, __cb) {
          let item = null;
          if (item = this.#events.get({ event: __event }, 1)) {     
               item.cbs.push({ sel: __selector, cb: __cb });
               return;
          }
          item = { event: __event, hear: null, cbs: new OGX.List({ sel: __selector, cb: __cb }) };         
          item.hear = document.addEventListener(__event, this.#onEvent.bind(this));
          this.#events.insert(item);
     }

     off(__event, __selector) {
          const item = this.#events.get({ event: __event }, 1);         
          if (item) {
               item.cbs.delete({ sel: __selector }, 1);
               if (!item.cbs.length) {
                    document.removeEventListener(__event, item.hear);
                    this.#events.delete({ event: __event }, 1);
               }
          }
     }

     #onEvent(__e) {         
          const item = this.#events.get({ event: __e.type }, 1);
          if (item) {
               item.cbs.forEach((__obj) => {
                    if (__e.target.closest(__obj.sel)) {
                         __obj.cb(__e);
                    }
               });
          }
     }
};
OGX.EventManager = new OGX.EventManager();
