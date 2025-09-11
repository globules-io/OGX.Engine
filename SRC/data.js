OGX.Data = class {
     merge(__a, __b, __options = {}) {
          const options_default = { overwrite: false, strict: false, copy: false };
          for (let a in options_default) {
               if (!__options.hasOwnProperty(a)) {
                    __options[a] = options_default[a];
               }
          }
          let base = __a;
          if (__options.copy) {
               base = this.clone(__a);
          }
          for (let a in __b) {
               if (!base.hasOwnProperty(a) && __options.strict) {
                    continue;
               }
               if (base.hasOwnProperty(a) && !__options.overwrite) {
                    continue;
               }
               base[a] = __b[a];
          }
          return base;
     }

     weld(__a, __b, __options = {}) {
          const options_default = { overwrite: false, strict: false, copy: false };
          this.merge(__options, options_default);
          let main;
          if (__options.copy) {
               main = this.clone(__a);
          } else {
               main = __a;
          }
          function merge(__m, __s) {
               for (let a in __s) {
                    if (!__m.hasOwnProperty(a)) {
                         if (__options.strict) {
                              continue;
                         }
                    }
                    if (!__m.hasOwnProperty(a) || __options.overwrite) {
                         __m[a] = __s[a];
                    } else {
                         if (typeof __s[a] === 'object' && !Array.isArray(__s[a])) {
                              merge(__m[a], __s[a]);
                         }
                    }
               }
          }
          merge(main, __b);
          return main;
     }

     clone(__obj) {
          return JSON.parse(JSON.stringify(__obj));
     }

     diff(__a, __b, __strict = false) {
          const o = {};
          let diff = false;
          for (let a in __b) {
               if ((!__strict && !__a.hasOwnProperty(a)) || (__strict && __a.hasOwnProperty(a) && __a[a] !== __b[a])) {
                    o[a] = __b[a];
                    diff = true;
               }
          }
          if (!diff) {
               return false;
          }
          return o;
     }

     adiff = function (__arr0, __arr1) {
          const arr = [];
          __arr0.forEach((__item) => {
               if (!__arr1.includes(__item)) {
                    arr.push(__item);
               }
          });
          __arr1.forEach((__item) => {
               if (!__arr0.includes(__item) && !arr.includes(__item)) {
                    arr.push(__item);
               }
          });
          return arr;
     };

     same(__oA, __oB, __deep = true) {
          let tA = 0;
          let tB = 0;
          let a;
          for (a in __oA) {
               tA++;
          }
          for (a in __oB) {
               tB++;
          }
          if (tA !== tB) {
               return false;
          }
          if (typeof __oA !== typeof __oB) {
               return false;
          }
          if (!['object', 'array'].includes(typeof __oA)) {
               return __oA === __oB;
          }
          function cycle(__A, __B) {
               let res;
               for (a in __A) {
                    if (typeof __A[a] !== typeof __B[a]) {
                         return false;
                    }
                    if (__deep && typeof __A[a] === 'object' && __B.hasOwnProperty(a)) {
                         res = cycle(__A[a], __B[a]);
                         if (!res) {
                              return false;
                         }
                    } else {
                         if (typeof __A[a] === 'array') {
                              if (__A[a].length !== __B[a].length) {
                                   return false;
                              }
                              __A[a].sort();
                              __B[a].sort();
                              if (!__deep) {
                                   if (JSON.parse(JSON.stringify(__A[a])) !== JSON.parse(JSON.stringify(__b[a]))) {
                                        return false;
                                   }
                              } else {
                                   for (let i = 0; i < __A[a].length; i++) {
                                        res = cycle(__A[a][i], __B[a][i]);
                                        if (!res) {
                                             return false;
                                        }
                                   }
                              }
                         } else {
                              if (__A[a] !== __B[a]) {
                                   return false;
                              }
                         }
                    }
               }
               return true;
          }
          return cycle(__oA, __oB);
     }

     intersect(__arr0, __arr1) {
          const arr = [];
          __arr0.forEach((__item) => {
               if (__arr1.includes(__item)) {
                    arr.push(__item);
               }
          });
          return arr;
     }

     trim(__obj) {
          function cycle(__o) {
               if (Array.isArray(__o)) {
                    __o.forEach((__oo) => {
                         cycle(__oo);
                    });
                    return;
               }
               for (let a in __o) {
                    if (typeof __o[a] === 'string') {
                         __o[a] = __o[a].trim();
                    } else {
                         if (typeof __o[a] === 'object') {
                              cycle(__o[a]);
                         }
                    }
               }
          }
          cycle(__obj);
     }     

     isInt(__n) {
          return Number(__n) === __n && __n % 1 === 0;
     }

     isFloat(__n) {
          return Number(__n) === __n && __n % 1 !== 0;
     }

     isSizeExp(__val) {
          if (typeof __val !== 'string') {
               return false;
          }
          __val = __val.trim();
          if (!__val.match(/[|\+\-=\[\]]/g)) {
               return false;
          }
          if (__val.trim().match(/(\d+(px|%)?\|?)+[\+-]?(\[=?\d+,? ?=?\d+?\])?/g)) {
               return true;
          }
          return false;
     }

     toSizeExp(__dimension, __min, __max) {
          typeof __min === 'undefined' ? (__min = 0) : null;
          typeof __max == 'undefined' ? (__max = 0) : null;
          if (!OGX.Data.isSizeExp(__dimension)) {
               __dimension = __dimension.toString() + JSON.stringify([__min, __max]);
               return __dimension;
          } else {
               if (__dimension.indexOf('[') !== -1) {
                    return __dimension;
               } else {
                    __dimension = __dimension += JSON.stringify([__min, __max]);
               }
          }
          return __dimension;
     }     

     clipboard(__text) {
          if (typeof __text !== 'undefined') {
               if (typeof navigator.clipboard !== 'undefined') {
                    navigator.clipboard.writeText(__text);
               } else {
                    let textArea = document.createElement('textarea');
                    textArea.value = __text;
                    textArea.style.top = '-1000px';
                    textArea.style.left = '0';
                    textArea.style.position = 'fixed';
                    document.body.appendChild(textArea);
                    OGX.DOM.trigger(textArea, 'focus');
                    textArea.select();
                    try {
                         document.execCommand('copy');
                    } catch (__err) {}
                    document.body.removeChild(textArea);
               }
          }
     }

     get2DTransform(__el) {
          const style = window.getComputedStyle(__el);
          const matrix = new DOMMatrix(style.transform);
          let angle = Math.round(Math.atan2(matrix.m12, matrix.m11) * (180 / Math.PI));
          angle += angle >= 0 ? 0 : 360;
          return { x: matrix.m41, y: matrix.m42, r: angle };
     }
};
OGX.Data = new OGX.Data();
