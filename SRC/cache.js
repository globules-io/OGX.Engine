OGX.Cache = class {
     cache;

     constructor() {
          cache = new OGX.List();
          cache.cache('ext', 'id');
     }

     read(__ext, __id) {
          const o = cache.read({ ext: __ext, id: __id }, 1);
          if (o) {
               if (o.ext === 'snd') {
                    return o;
               }
               return o.data;
          }
          return false;
     }

     get(__query, __limit = 0) {
          return cache.get(__query, __limit);
     }

     set(__array) {
          cache = new OGX.List(__array);
     }

     add(__o) {
          if (Array.isArray(__o)) {
               __o.forEach((__obj) => {
                    cache.insert(__obj);
               });
          } else {
               cache.insert(__o);
          }
     }

     remove(__ext, __id, __limit = 1) {
          const query = {};
          if (typeof __ext !== 'undefined' && __ext) {
               query.ext = __ext;
          }
          if (typeof __id !== 'undefined' && __id) {
               query.id = __id;
          }
          return cache.delete({ ext: __ext, id: __id }, __limit);
     }
};
