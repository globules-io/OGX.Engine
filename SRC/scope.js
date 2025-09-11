OGX.Scope = class {
     CHANGE = 'ScopeChange';

     scope = 'public';
     #token = false;
     #jwt = false;

     constructor(__jwt){
          this.#jwt = __jwt;
     }

     scope(__string) {
          if (typeof __string === 'undefined') {
               return scope;
          }
          if (!this.#jwt) {
               this.scope = __string;
               return true;
          }
          OGX.Events.trigger(this.CHANGE);
          return false;
     }

     token(__token, __issuer) {
          if (typeof __token === 'undefined') {
               if (this.#token) {
                    return true;
               }
               return false;
          }
          const t = this.#verifyToken(__token);
          if (t && t.iss === __issuer) {
               this.#token = __token;
               this.scope = t.scope;
               OGX.Events.trigger(this.CHANGE);
               return true;
          }
          return false;
     }

     eval(__exp, __scope) {
          typeof __scope === 'undefined' ? (__scope = this.scope) : null;
          if (Array.isArray(__exp)) {
               __exp = __exp.join(' ');
          }
          __exp = this.#regex(__exp);
          let sc = __scope;
          typeof sc === 'string' ? (sc = sc.split(' ')) : null;
          const reg = /(?!0|1)([a-z0-9_]+)/gi;
          const matches = __exp.match(reg);
          if (matches && matches.length) {
               for (let i = 0; i < matches.length; i++) {
                    if (sc.includes(matches[i])) {
                         __exp = __exp.replace(matches[i], '1');
                    } else {
                         __exp = __exp.replace(matches[i], '0');
                    }
               }
          }
          __exp = __exp.replace(/ /g, '|');
          try {
               const f = new Function('return ' + __exp + ';');
               const res = f();
               if (typeof res === 'number') {
                    return res > 0;
               }
               return false;
          } catch (error) {}
          return false;
     }

     fork(__node) {
          for (let exp in __node) {
               if (this.eval(exp)) {
                    return __node[exp];
               }
          }
          return false;
     }

     #verifyToken(__token) {
          let o = JSON.parse(atob(__token.split('.')[1]));
          if (o) {
               return o;
          }
          return false;
     }

     #regex(__exp) {
          const isReg = __exp.match(/^\/\^?/);
          if (!isReg) {
               return __exp;
          }
          const arr = __exp.split(' ');
          let reg;
          for (let i = 0; i < arr.length; i++) {
               if (arr[i].match(/^\/\^?/)) {
                    reg = arr[i].trim();
                    reg = reg.replace(/^\/\^?/, '');
                    reg = reg.replace(/\$?\/$/, '');
                    reg = new RegExp(reg, 'g');
                    if (this.scope.match(reg)) {
                         __exp = __exp.replace(arr[i], '1');
                    } else {
                         __exp = __exp.replace(arr[i], '0');
                    }
               }
          }
          return __exp;
     }
};
