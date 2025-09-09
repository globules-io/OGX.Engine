OGX.Touch = class {

     touch = null;   

     constructor() {
          this.touch = new OGX.TouchManager(this);          
     }   

     on(__event, __target, __callback){    
          const args = [];      
          if(arguments.length === 2){ 
               args.push(this.selector);
               __callback = __target;
          }else{
               args.push(this.selector+' '+__target);
          } 
          args.push(__callback);                
          OGX.EventManager.on(...args);          
     } 

     off(__event, __target){         
          const args = [__event];      
          if(arguments.length === 1){ 
               args.push(this.selector);
          }else{
               args.push(this.selector+' '+__target);
          } 
          OGX.EventManager.off(...args);         
     }      
};

//Uxi.touch
OGX.TouchManager = class {

     #touch = null;
     hold = {};
     click = 'click';
     dbclick = 'dblclick';
     enter = 'mouseenter';
     leave = 'mouseleave';
     over = 'mouseover';
     out = 'mouseout';
     down = 'mousedown';
     up = 'mouseup';
     move = 'mousemove';

     #touches = new OGX.List();

     #id = 0;

     constructor(__touch){     
          this.#touch = __touch;     
          if (typeof window.ontouchstart !== 'undefined') {
               this.down = 'touchstart';
               this.up = 'touchend';
               this.move = 'touchmove';
          } 
     }

     enable(){
          const touches = this.#touches.get({state:'manual'});
          touches.forEach(__touch => {
               __touch.enable();
          });          
     }
     disable(){
          const touches = this.#touches.get({state:'manual'});
          touches.forEach(__touch => {
               __touch.disable();
          });
     }
     add(__type, __selector, __config) {
          !__config.hasOwnProperty('id') ? __config.id = this.#id++ : null;
          const touch = new OGX.Touches[__type](this, __selector, __config);  
          this.#touches.insert(touch);
          return touch;
     }
     remove(__id_or_touch) {
          typeof(__id_or_touch) === 'object' ? __id_or_touch = __id_or_touch.id : null;
          const touch = this.#touches.delete({id: __id_or_touch}, 1);
          if(touch){
               touch.disable();
               return true;
          }
          return false;
     }
     get() {
          return this.#touches.get({id: __id}, null, 1);
     }
     wipe() {
          disable();       
          this.#touches.clear();
     }
     isRightClick(){}
};

