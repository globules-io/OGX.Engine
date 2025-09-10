OGX.OSE = class {
     #filters = {
          uppercase: (__str) => String(__str).toUpperCase(),
          lowercase: (__str) => String(__str).toLowerCase(),
          trim: (__str) => String(__str).trim(),
          capitalize: (str) => String(__str).charAt(0).toUpperCase() + __str.slice(1),
          currency: (__val, __symbol = '$') => `${__symbol}${parseFloat(__val).toFixed(2)}`,
          add: (__val, __n) => Number(__val) + Number(__n),
          formatDate: (__date, __format = 'YYYY-MM-DD') => new Date(__date).toISOString().slice(0, 10),
          round: (__val) => Math.round(Number(__val)),
          floor: (__val) => Math.floor(Number(__val)),
          ceil: (__val) => Math.ceil(Number(__val)),
          default: (__val, __fallback) => __val ?? __fallback,
          length: (__val) => (Array.isArray(__val) || typeof __val === 'string' ? __val.length : 0),
          json: (__val) => JSON.stringify(__val),
          slice: (__val, __start, __end) => (typeof __val === 'string' || Array.isArray(__val) ? __val.slice(__start, __end) : __val),
          replace: (__str, __search, __replace) => String(__str).replace(__search, __replace),
          join: (__arr, __delimiter = ',') => (Array.isArray(__arr) ? __arr.join(__delimiter) : __arr),
          split: (__str, __delimiter = ',') => String(__str).split(__delimiter),
          reverse: (__val) => (Array.isArray(__val) ? [...__val].reverse() : String(__val).split('').reverse().join('')),
          includes: (__val, __needle) => (Array.isArray(__val) || typeof __val === 'string' ? __val.includes(__needle) : false),
          startsWith: (__str, __prefix) => String(__str).startsWith(__prefix),
          endsWith: (__str, __suffix) => String(__str).endsWith(__suffix),
          stripHtml: (__str) => String(__str).replace(/<[^>]*>/g, ''),
          truncate: (__str, __length = 100, __suffix = '...') => {
               __str = String(__str);
               return __str.length > length ? __str.slice(0, __length) + __suffix : __str;
          },
          pad: (__str, __length = 10, __char = ' ') => {
               __str = String(__str);
               return __str.length >= __length ? __str : __str + __char.repeat(__length - __str.length);
          },
          padLeft: (__str, __length = 10, __char = ' ') => {
               __str = String(__str);
               return __str.length >= length ? __str : __char.repeat(__length - __str.length) + __str;
          },          
          highlightMatch: (__text, __query) => {
               if (!__query) return __text;
               const regex = new RegExp(__query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
               return String(__text).replace(regex, (__match) => `<mark>${__match}</mark>`);
          }
     };

     get(__id) {
          return OGX.Cache.read('ose', __id);
     }

     exec(__string, __context = {}) {
          const context = { $: null, '@': null, '%': null };
          const body = OGX.DOM.el('body');
          OGX.Data.merge(context, __context, { overwrite: true, strict: true });
          context.screen = {
               width: body.clientWidth,
               height: body.clientHeight,
               orientation: body.clientWidth > body.clientHeight ? 'landscape' : 'portrait',
               viewportRatio: +(body.clientWidth / body.clientHeight).toFixed(2),
               pixelDensity: window.devicePixelRatio || 1,
          };
          const tokens = this.tokenize(__string);
          const ast = this.parse(tokens);
          return this.#evaluate(ast, context);
     }

     #tokenize(__input) {
          const tokens = [];
          let i = 0;

          while (i < __input.length) {
               // Check for opening delimiters
               if (__input.startsWith('{{', i)) {
                    // SCRIPT BLOCK: {{#script}} ... {{/script}}
                    if (__input.startsWith('{{#script}}', i)) {
                         i += 11; // Skip "{{#script}}"
                         let script = '';
                         while (!__input.startsWith('{{/script}}', i)) {
                              script += __input[i++];
                         }
                         i += 11; // Skip "{{/script}}"
                         tokens.push({ type: 'SCRIPT_BLOCK', value: script.trim() });

                         //Uxi fetch
                    } else if (input.startsWith('{{uxi', i)) {
                         i += 5;
                         let expr = '';
                         while (!input.startsWith('}}', i)) {
                              expr += input[i++];
                         }
                         i += 2;
                         tokens.push({ type: 'UXI_CALL', value: expr.trim() });

                         // JSON file {{json variable}}
                    } else if (__input.startsWith('{{json ', i)) {
                         i += 7;
                         let varName = '';
                         while (!__input.startsWith('}}', i)) {
                              varName += __input[i++];
                         }
                         i += 2;
                         tokens.push({ type: 'JSON_CALL', value: varName.trim() });

                         // OML file {{oml variable}}
                    } else if (__input.startsWith('{{oml ', i)) {
                         i += 6;
                         let varName = '';
                         while (!__input.startsWith('}}', i)) {
                              varName += __input[i++];
                         }
                         i += 2;
                         tokens.push({ type: 'OML_CALL', value: varName.trim() });

                         //MONGOGX {{mongogx db.collection.find(query)}}
                    } else if (__input.startsWith('{{mongogx ', i)) {
                         i += 10;
                         let expr = '';
                         while (!__input.startsWith('}}', i)) {
                              expr += __input[i++];
                         }
                         i += 2;
                         tokens.push({ type: 'MONGOGX_CALL', value: expr.trim() });

                         //METHOD {{method test id:Class}}
                    } else if (input.startsWith('{{method ', i)) {
                         i += 9;
                         let expr = '';
                         while (!input.startsWith('}}', i)) {
                              expr += input[i++];
                         }
                         i += 2;
                         tokens.push({ type: 'METHOD_CALL', value: expr.trim() });

                         // EXPRESSION: {{= expression }}
                    } else if (__input.startsWith('{{=', i)) {
                         i += 3; // Skip "{{="
                         let expr = '';
                         while (!__input.startsWith('}}', i)) {
                              expr += __input[i++];
                         }
                         i += 2; // Skip "}}"
                         tokens.push({ type: 'EXPRESSION', value: expr.trim() });

                         // TEMPLATE CALL: {{template $var $}}
                    } else if (__input.startsWith('{{template ', i)) {
                         i += 11; // Skip "{{template "
                         let parts = '';
                         while (!__input.startsWith('}}', i)) {
                              parts += __input[i++];
                         }
                         i += 2; // Skip "}}"
                         const [templateVar, dataVar] = parts.trim().split(/\s+/);
                         tokens.push({
                              type: 'TEMPLATE_CALL',
                              templateVar,
                              dataVar,
                         });

                         // IF BLOCK OPEN: {{#if $condition}}
                    } else if (__input.startsWith('{{#if ', i)) {
                         i += 6;
                         let condition = '';
                         while (!__input.startsWith('}}', i)) {
                              condition += __input[i++];
                         }
                         i += 2;
                         tokens.push({ type: 'IF_OPEN', value: condition.trim() });

                         // IF BLOCK CLOSE: {{/if}}
                    } else if (__input.startsWith('{{/if}}', i)) {
                         i += 7;
                         tokens.push({ type: 'IF_CLOSE' });

                         // EACH BLOCK OPEN: {{#each $list}}
                    } else if (__input.startsWith('{{#each ', i)) {
                         i += 8;
                         let listVar = '';
                         while (!__input.startsWith('}}', i)) {
                              listVar += __input[i++];
                         }
                         i += 2;
                         tokens.push({ type: 'EACH_OPEN', value: listVar.trim() });

                         // EACH BLOCK CLOSE: {{/each}}
                    } else if (__input.startsWith('{{/each}}', i)) {
                         i += 9;
                         tokens.push({ type: 'EACH_CLOSE' });

                         // VARIABLE: {{name}}, {{@temp}}, {{$value}}
                    } else {
                         i += 2; // Skip opening {{
                         let varName = '';
                         while (!__input.startsWith('}}', i)) {
                              varName += __input[i++];
                         }
                         i += 2; // Skip closing }}
                         tokens.push({ type: 'VAR', value: varName.trim() });
                    }

                    // TEXT: Anything outside of {{...}}
               } else {
                    let text = '';
                    while (i < __input.length && !__input.startsWith('{{', i)) {
                         text += __input[i++];
                    }
                    tokens.push({ type: 'TEXT', value: text });
               }
          }

          return tokens;
     }

     #parse(__tokens) {
          const ast = [];
          const walk = () => {
               const node = [];

               while (__tokens.length) {
                    const token = __tokens.shift();

                    switch (token.type) {
                         case 'SCRIPT_BLOCK':
                              node.push({ type: 'ScriptBlock', code: token.value });
                              break;

                         case 'EXPRESSION':
                              node.push({ type: 'Expression', code: token.value });
                              break;

                         case 'TEXT':
                              node.push({ type: 'Text', value: token.value });
                              break;

                         case 'VAR':
                              node.push(this.#parseVariableExpression(token.value));
                              break;

                         case 'TEMPLATE_CALL':
                              node.push({
                                   type: 'TemplateCall',
                                   templateVar: token.templateVar,
                                   dataVar: token.dataVar,
                              });
                              break;

                         case 'JSON_CALL':
                              node.push({
                                   type: 'JsonCall',
                                   name: token.value,
                              });
                              break;

                         case 'OML_CALL':
                              node.push({
                                   type: 'OmlCall',
                                   name: token.value,
                              });
                              break;

                         case 'MONGOGX_CALL':
                              node.push({
                                   type: 'MongOGXCall',
                                   expression: token.value,
                              });
                              break;

                         case 'METHOD_CALL':
                              node.push({
                                   type: 'MethodCall',
                                   expression: token.value,
                                   filters: token.filters ?? [],
                              });
                              break;

                         case 'UXI_CALL':
                              node.push({
                                   type: 'UxiCall',
                                   expression: token.value,
                              });
                              break;

                         case 'IF_OPEN': {
                              const condition = token.value;
                              const body = walk();
                              node.push({ type: 'IfBlock', condition, body });
                              break;
                         }

                         case 'IF_CLOSE':
                              return node;

                         case 'EACH_OPEN': {
                              const listVar = token.value;
                              const body = walk();
                              node.push({ type: 'EachBlock', listVar, body });
                              break;
                         }

                         case 'EACH_CLOSE':
                              return node;

                         default:
                              throw new Error(`Unknown token type: ${token.type}`);
                    }
               }

               return node;
          };

          return walk();
     }

     #evaluate(__ast, __context) {
          const tempVars = {};
          const filters = this.#filters ?? {};
          const renderNode = (__node) => {
               switch (__node.type) {
                    case 'ScriptBlock': {
                         const sandbox = { ...__context, ...tempVars };
                         const keys = Object.keys(sandbox);
                         const values = Object.values(sandbox);

                         try {
                              const fn = Function(...keys, __node.code);
                              fn(...values);
                         } catch (err) {
                              console.warn('ScriptBlock error:', err);
                         }

                         keys.forEach((__key, __i) => {
                              if (__key.startsWith('@')) {
                                   tempVars[__key] = values[__i];
                              }
                         });

                         return '';
                    }

                    case 'Variable': {
                         const raw = this.#resolveValue(__node.name, __context, tempVars);
                         return __node.filters ? this.#applyFilters(raw, __node.filters, filters) : raw;
                    }

                    case 'Expression': {
                         const sandbox = { ...__context, ...tempVars };
                         try {
                              return Function(...Object.keys(sandbox), `return ${__node.code}`)(...Object.values(sandbox));
                         } catch (err) {
                              console.warn('Expression error:', err);
                              return '';
                         }
                    }

                    case 'JsonCall': {
                         const value = this.#resolveValue(__node.name, __context, tempVars);
                         const result = OGX.Cache.read('json', value);
                         return typeof result === 'string' ? result : JSON.stringify(result);
                    }

                    case 'OmlCall': {
                         const value = this.#resolveValue(__node.name, __context, tempVars);
                         const result = OGX.Cache.read('oml', value);
                         return typeof result === 'string' ? result : JSON.stringify(result);
                    }

                    case 'TemplateCall': {
                         const templateName = this.#resolveValue(__node.templateVar, __context, tempVars);
                         const data = this.#resolveValue(__node.dataVar, __context, tempVars);
                         const rawTemplate = OGX.Cache.read('html', templateName);
                         if (!rawTemplate) return `<!-- Template "${templateName}" not found -->`;
                         const tokens = this.#tokenize(rawTemplate);
                         const innerAST = this.#parse(tokens);
                         return this.#evaluate(innerAST, data);
                    }

                    case 'MongOGXCall': {
                         const regex = /([a-z0-9_\-]+)\.([a-z0-9_\-]+)\.([a-z]+)\(([\s\S]+?)\)/i;
                         const match = regex.exec(__node.expression);
                         if (!match) return `<!-- Invalid mongogx expression -->`;
                         const [_, db, collection, method, rawArgs] = match;
                         const resolvedArgs = rawArgs.replace(/([@$%])([a-z0-9_\-]+)/gi, (_, __prefix, __key) => {
                              const fullKey = __prefix + __key;
                              const value = this.#resolveValue(fullKey, __context, tempVars);
                              return typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
                         });
                         try {
                              mongogx.setDatabase(db);
                              mongogx.setCollection(collection);
                              const fn = Function('mongogx', `return mongogx.${method}(${resolvedArgs});`);
                              return fn(mongogx);
                         } catch (err) {
                              console.warn('MongoGX error:', err);
                              return `<!-- MongoGX execution failed -->`;
                         }
                    }

                    case 'MethodCall': {
                         const regex = /method\s+([a-zA-Z0-9_\-\.]+(?:\([^)]*\))*)\s+([a-zA-Z0-9_\-\.]+):([a-zA-Z0-9_\-]+)/i;
                         const match = regex.exec(__node.expression);
                         if (!match) return `<!-- Invalid method directive -->`;
                         const [, chainExpr, rawId, className] = match;
                         const id = this.#resolveValue(rawId, __context, tempVars);
                         try {
                              const obj = OGX.Object.get({ _NAME_: { eq: className }, id: { eq: id } }, null, 1);
                              if (!obj) return `<!-- Object not found -->`;
                              // Split chain: getData().filter().map($transform)
                              const calls = chainExpr.split('.');
                              let target = obj;
                              for (let call of calls) {
                                   const methodMatch = /^([a-zA-Z0-9_\-]+)(\(([^)]*)\))?$/.exec(call.trim());
                                   if (!methodMatch) continue;
                                   const [, methodName, , argStr] = methodMatch;
                                   const method = target?.[methodName];
                                   if (typeof method !== 'function') return `<!-- Method ${methodName} not found -->`;
                                   const args = argStr ? argStr.split(',').map((__arg) => this.#resolveValue(__arg.trim(), __context, tempVars)) : [];
                                   target = method.apply(target, args);
                              }
                              const filtered = __node.filters ? this.#applyFilters(target, __node.filters, this.#filters ?? {}) : target;
                              return typeof filtered === 'string' ? filtered : JSON.stringify(filtered);
                         } catch (err) {
                              console.warn('Method chaining error:', err);
                              return `<!-- Method chaining failed -->`;
                         }
                    }

                    case 'UxiCall': {
                         const regex = /uxi\.?([a-z0-9_]+)?\s*(?:#|\$|&|@|%)*([a-z0-9_\-\.]+):([a-z0-9]+)/i;
                         const match = regex.exec(__node.expression);
                         if (!match) return `<!-- Invalid uxi expression -->`;
                         const [, prop, rawValue, className] = match;
                         // Resolve dynamic value
                         const value = this.#resolveValue(rawValue, __context, tempVars);
                         const query = {
                              _NAME_: { eq: className },
                         };
                         if (prop) {
                              query[prop] = { eq: value };
                         } else {
                              query.id = { eq: value };
                         }
                         try {
                              const result = OGX.Object.get(query, null, 1);
                              const filtered = __node.filters ? this.#applyFilters(result, __node.filters, this.#filters ?? {}) : result;

                              return typeof filtered === 'string' ? filtered : JSON.stringify(filtered);
                         } catch (err) {
                              console.warn('UXI error:', err);
                              return `<!-- UXI lookup failed -->`;
                         }
                    }

                    case 'IfBlock': {
                         const condition = __context[__node.condition.slice(1)];
                         return condition ? this.#evaluate(__node.body, __context) : '';
                    }

                    case 'EachBlock': {
                         const items = __context[__node.listVar.slice(1)];
                         if (!Array.isArray(items)) return '';
                         return items
                              .map((__item, __index) => {
                                   const loopContext = {
                                        ...__item,
                                        '@index': __index,
                                   };
                                   return this.#evaluate(__node.body, loopContext);
                              })
                              .join('');
                    }

                    case 'Text':
                         return __node.value;

                    default:
                         return '';
               }
          };

          return __ast.map(renderNode).join('');
     }

     #parseVariableExpression(__raw) {
          const parts = __raw.split('|').map((__p) => __p.trim());
          const base = parts[0];
          const filters = parts.slice(1).map((__f) => {
               const match = __f.match(/^(\w+)(\((.*)\))?$/);
               const name = match[1];
               const args = match[3] ? match[3].split(',').map((a) => a.trim().replace(/^["']|["']$/g, '')) : [];
               return { name, args };
          });
          return {
               type: 'Variable',
               name: base,
               filters,
          };
     }

     #resolveValue(__name, __context, __tempVars) {
          const getPath = (__obj, __path) => {
               return __path.split('.').reduce((__acc, __key) => __acc?.[__key], __obj);
          };
          if (__name.startsWith('$')) {
               return getPath(__context['$'], __name.slice(1));
          } else if (__name.startsWith('%')) {
               return getPath(__context['%'], __name.slice(1));
          } else if (__name.startsWith('@')) {
               return getPath(__context['@'] ?? __tempVars, __name.slice(1));
          } else {
               return getPath(__context, __name) ?? __name;
          }
     }

     #applyFilters(__value, __filterChain, __filters) {
          return __filterChain.reduce((__acc, { __name, __args }) => {
               const fn = __filters[__name];
               return fn ? fn(__acc, ...__args) : __acc;
          }, __value);
     }
};
OGX.OSE = new OGX.OSE();
