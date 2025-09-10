OGX.DOM = class{  

     ready(__cb){
          document.addEventListener('DOMContentLoaded', __cb);
     }

     el(__sel){
          if(__sel instanceof HTMLDocument){
               return __sel;
          }
          if(__sel instanceof HTMLElement){
               return __sel;
          }
          const el = document.querySelector(__sel);
          if(el){
               return el;
          }
          return null;
     }

     find(__sel, __query){
          if(arguments.length === 1){
               __query = __sel;
               __sel = document;
          }
          const el = this.el(__sel);
          if(el){
              return [... el.querySelectorAll(__query)];
          }
          return [];
     }

     get(__id){
          return this.el('.ogx_uxi[data-ogx-id="'+__id+'"]');
     }

     uxi(__id){
          const el = document.createElement('div');
          el.classList.add('ogx_uxi');
          el.setAttribute('data-ogx-id', __id);
          return el;
     }

     trigger(__sel, __event, __data={}){   
          const el = this.el(__sel);
          if(el){
               const customEvent = new CustomEvent(__event, __data);
               el.dispatchEvent(customEvent);
               return this;
          }
          return false;
     }     

     position(__sel){
          const el = this.el(__sel);
          if(el){
               const rect = el.getBoundingClientRect();
               return {x: rect.left, y: rect.top};
          }
          return null;
     }

     offset(__sel){
          const el = this.el(__sel);
          if(el){
               return {x: el.offsetLeft, y: el.offsetTop};
          }
          return null;
     }

     attr(__sel, __attr, __val){
          const el = this.el(__sel);
          if(el){
               if(typeof __val !== 'undefined'){
                    el.setAttribute(__attr, __val);
                    return this;
               }
               return el.getAttribute(__attr);
          }
          return null;
     }

     width(__sel){
          const el = this.el(__sel);
          if(el){
               return el.clientWidth;
          }
     }

     height(__sel){
          const el = this.el(__sel);
          if(el){
               return el.clientHeight;
          }
     }

     css(__sel, __obj){
          const el = this.el(__sel);
          if(el){
               for(let prop in __obj){
                    el.style[prop] = __obj[prop];
               }
               return this;
          }
          return null;
     }

     on(__sel, __event, __cb, __passive=true){
          const el = this.el(__sel);
          if(el){
               el.addEventListener(__event, (__e, __data) => {
                    __cb(__e, __data);
               }, { passive: __passive });
               return this;
          }
     }

     off(__sel){
          const el = this.el(__sel);
          if(el){
               el.removeEventListener(__event);
               return this;
          }
     }

     data(__sel, __attr, __val){
          const el = this.el(__sel);
          if(el){
               if(typeof __val !== 'undefined'){
                    el.setAttribute(__attr, __val);
                    return this;
               }
               return el.getAttribute(__attr);
          }
          return null;
     }

     hasClass(__sel, __class){
          const el = this.el(__sel);
          if(el){
               return el.classList.contains(__class);
          }
          return null;
     }

     addClass(__sel, __class){
          const el = this.el(__sel);
          if(el){
               if(!this.hasClass(el, __class)){  
                    el.classList.add(__class);              
               }
          }
          return this;
     }

     removeClass(__sel, __class){
          if(!this.hasClass(__sel, __class)){
               const el = this.el(__sel);
               if(el){
                    el.classList.remove(__class);
               }
          }
          return this;
     }

     attach(__sel, __el){
          const el = this.el(__sel);
          if(el){
               el.appendChild(__el);
               return this;
          }
          return null;
     }

     detach(__sel){
          const el = this.el(__sel);
          if(el){
               el.remove();
               return el;
          }
          return null;
     }

     remove(__sel){
          const el = this.el(__sel);
          if(el){
               el.remove();               
          }
          return this;
     }

     html(__sel, __html){
          const el = this.el(__sel);
          if(el){
               if(typeof __html === 'undefined'){
                    return el.innerHTML;
               }
               el.innerHTML = __html;
               return this;
          }
          return null;
     } 

     append(__sel, __html){
          const el = this.el(__sel);
          if(el){
               el.insertAdjacentHTML('beforeend', __html);
               return this;
          }
          return null;
     }

     prepend(__sel, __hmtl){
          const el = this.el(__sel);
          if(el){
               el.insertAdjacentHTML('afterbegin', __html);
               return this;
          }
          return null;
     }
}
const $ = OGX.DOM = new OGX.DOM();