OGX.Workers = class {
     #id = 0;
     #workers = new OGX.List();
     #lifecycleHooks = new Map();
     #pool = [];
     #queue = [];
     #active = 0;
     #maxConcurrency = 4;
     #agingInterval = null;

     constructor(__poolSize = 4) {
          this.#maxConcurrency = __poolSize;
          this.#pool = new Array(__poolSize).fill(null);
          this.#startAging();
     }

     get(__id) {
          return this.#workers.get(__id, 1);
     }

     add(__fn, __id = ++this.#id, __scripts) {
          const __worker = this.#createWorker(__fn, __scripts);
          if (!__worker) return null;
          __worker.id = __id;
          this.#workers.insert(__worker);
          return __id;
     }

     remove(__id) {
          const __worker = this.#workers.get({ id: { eq: __id } }, null, 1);
          if (!__worker) return false;
          __worker.terminate();
          this.#workers.findDelete('id', __id, 1);
          this.#lifecycleHooks.delete(__id);
          return true;
     }

     call(__id, __params, __callback = null, __cbParams) {
          const __worker = this.#workers.get({ id: { eq: __id } }, null, 1);
          if (!__worker) return false;
          __worker.onmessage = (__e) => __callback?.(__e.data, __cbParams);
          __worker.postMessage(__params);
          return __worker;
     }

     run(__fn, __id = ++this.#id, __scripts = null, __interval = null, __intervalParams = null, __callback = null, __cbParams) {
          if (!__interval) return false;
          const __worker = this.#createWorker(__fn, __scripts, __interval, __intervalParams);
          if (!__worker) return null;
          __worker.id = __id;
          this.#workers.insert(__worker);
          __worker.onmessage = (__e) => __callback?.(__e.data, __cbParams);
          return __id;
     }

     enqueue(__taskFn, __params, __callback = null, __scripts = [], __priority = 0) {
          const __taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2);
          this.#queue.push({
               __taskId,
               __taskFn,
               __params,
               __callback,
               __scripts,
               __priority,
               __timestamp: Date.now()
          });
          this.#sortQueue();
          this.#dispatch();
          return __taskId;
     }

     cancel(__taskId) {
          const __index = this.#queue.findIndex(__t => __t.__taskId === __taskId);
          if (__index !== -1) {
               this.#queue.splice(__index, 1);
               return true;
          }
          return false;
     }     

     stop(__id) {
          const __worker = this.#workers.get({ id: { eq: __id } }, null, 1);
          if (!__worker) return false;
          __worker.postMessage('__stop__');
          this.#lifecycleHooks.get(__id)?.onStop?.();
          return true;
     }

     start(__id) {
          const __worker = this.#workers.get({ id: { eq: __id } }, null, 1);
          if (!__worker) return false;
          __worker.postMessage('__start__');
          this.#lifecycleHooks.get(__id)?.onStart?.();
          return true;
     }

     pause(__id) {
          const __worker = this.#workers.get({ id: { eq: __id } }, null, 1);
          if (!__worker) return false;
          __worker.postMessage('__pause__');
          this.#lifecycleHooks.get(__id)?.onPause?.();
          return true;
     }

     resume(__id) {
          const __worker = this.#workers.get({ id: { eq: __id } }, null, 1);
          if (!__worker) return false;
          __worker.postMessage('__resume__');
          this.#lifecycleHooks.get(__id)?.onResume?.();
          return true;
     }

     status(__id) {
          const __worker = this.#workers.get({ id: { eq: __id } }, null, 1);
          if (!__worker) return 'not found';
          return 'active';
     }

     onStart(__id, __callback) {
          if (!this.#lifecycleHooks.has(__id)) this.#lifecycleHooks.set(__id, {});
          this.#lifecycleHooks.get(__id).onStart = __callback;
     }

     onStop(__id, __callback) {
          if (!this.#lifecycleHooks.has(__id)) this.#lifecycleHooks.set(__id, {});
          this.#lifecycleHooks.get(__id).onStop = __callback;
     }

     onPause(__id, __callback) {
          if (!this.#lifecycleHooks.has(__id)) this.#lifecycleHooks.set(__id, {});
          this.#lifecycleHooks.get(__id).onPause = __callback;
     }

     onResume(__id, __callback) {
          if (!this.#lifecycleHooks.has(__id)) this.#lifecycleHooks.set(__id, {});
          this.#lifecycleHooks.get(__id).onResume = __callback;
     }

     #startAging() {
          this.#agingInterval = setInterval(() => {
               const __now = Date.now();
               for (const __task of this.#queue) {
               const __age = __now - __task.__timestamp;
               if (__age > 5000) { // every 5s, bump priority
                    __task.__priority += 1;
                    __task.__timestamp = __now;
               }
               }
               this.#sortQueue();
          }, 5000);
     }

     #sortQueue() {
          this.#queue.sort((__a, __b) => __b.__priority - __a.__priority);
     }

     #dispatch() {
          while (this.#active < this.#maxConcurrency && this.#queue.length > 0) {
               const {
                    __taskFn,
                    __params,
                    __callback,
                    __scripts,
                    __taskId
               } = this.#queue.shift();
               const __worker = this.#createWorker(__taskFn, __scripts);
               if (!__worker) continue;
               this.#active++;
               const __slot = this.#pool.findIndex(__w => __w === null);
               if (__slot !== -1) this.#pool[__slot] = __worker;
               __worker.onmessage = (__e) => {
               __callback?.(__e.data);
               __worker.terminate();
               if (__slot !== -1) this.#pool[__slot] = null;
               this.#active--;
               this.#dispatch();
               };
               __worker.postMessage(__params);
          }
     }     

     #createWorker(__fn, __scripts = [], __interval = false, __intervalParams = null) {
          try {
               if (typeof __fn === 'string') return new Worker(__fn);

               const __scriptImports = __scripts.length ? `importScripts('${__scripts.map((__s) => `${location.origin}/${__s}`).join("','")}');\n` : '';

               const __fnStr = this.#wrapFunction(__fn);
               const __controlLogic = __interval ? this.#buildIntervalLogic(__interval, __intervalParams) : '';
               const __messageHandler = `
        onmessage = function(__e) {
          if (__e.data === "__stop__") { __stop?.(); return; }
          if (__e.data === "__start__") { __start?.(); return; }
          if (__e.data === "__pause__") { __pause?.(); return; }
          if (__e.data === "__resume__") { __resume?.(); return; }
          postMessage(__work.call(null, __e.data));
        };
      `;

               const __fullScript = `${__scriptImports}${__fnStr}\n${__controlLogic}\n${__messageHandler}`;
               const __blob = new Blob([__fullScript], { type: 'text/javascript' });
               return new Worker(URL.createObjectURL(__blob));
          } catch (__err) {
               console.error('Worker creation failed:', __err);
               return null;
          }
     }

     #wrapFunction(__fn) {
          let __str = __fn.toString();
          const __match = /^function\s+([\w]+)?/.exec(__str);
          return __match?.[1] ? __str.replace(__match[1], '__work') : __str.replace('function', 'function __work');
     }

     #buildIntervalLogic(__interval, __params) {
          return `
      let __intv = null;
      let __paused = false;

      const __stop = () => clearInterval(__intv);
      const __start = () => {
        if (__intv) __stop();
        __intv = setInterval(() => {
          if (!__paused) postMessage(__work.call(null, ${JSON.stringify(__params)}));
        }, ${__interval});
      };
      const __pause = () => { __paused = true; };
      const __resume = () => { __paused = false; };

      __start();
    `;
     }
};
