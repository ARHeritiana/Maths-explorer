import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {GALLERY_OBJECTS} from '../site/js/gallery-objects.js';

test('fractal gestures replace view buttons, reset either plane, and stop drifting at zoom limits',()=>{
  const dom=new JSDOM('<main></main>',{pretendToBeVisual:true}),w=dom.window;
  const names=['document','devicePixelRatio','requestAnimationFrame','cancelAnimationFrame','CustomEvent'];
  const prior=new Map(names.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const frames=new Map(),contexts=new Map();let next=0,stop;
  try{
    globalThis.document=w.document;globalThis.devicePixelRatio=1;globalThis.CustomEvent=w.CustomEvent;
    globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};
    globalThis.cancelAnimationFrame=id=>frames.delete(id);
    w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:400});
    w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};
    w.HTMLCanvasElement.prototype.getContext=function(){
      if(!contexts.has(this))contexts.set(this,{setTransform(){},createImageData:(x,y)=>({data:new Uint8ClampedArray(x*y*4)}),putImageData(image){this.pixels=image.data;},drawImage(source){this.pixels=contexts.get(source).pixels;},beginPath(){},arc(){},moveTo(){},lineTo(){},stroke(){}});
      return contexts.get(this);
    };
    const root=document.querySelector('main');stop=GALLERY_OBJECTS.mandelbrot(root,{t:(fr)=>fr,reduced:()=>true,lang:'fr'});
    const tick=()=>{const [id,fn]=frames.entries().next().value;frames.delete(id);fn(1000+next*20);};
    const main=root.querySelector('#mb-stage canvas'),julia=root.querySelector('#mb-julia canvas');
    const pixels=c=>createHash('sha256').update(contexts.get(c).pixels).digest('hex');
    const wheel=(c,deltaY)=>{c.dispatchEvent(new w.WheelEvent('wheel',{clientX:480,clientY:100,deltaY,cancelable:true}));tick();};
    const key=(c,key)=>{c.dispatchEvent(new w.KeyboardEvent('keydown',{key,cancelable:true}));tick();};
    const pointer=(c,type,id,x,y,touch=false)=>{const e=new w.MouseEvent(type,{clientX:x,clientY:y,button:0,cancelable:true});Object.defineProperties(e,{pointerId:{value:id},pointerType:{value:touch?'touch':'mouse'}});c.dispatchEvent(e);};
    tick();const original=pixels(main),jOriginal=pixels(julia);
    assert.equal(root.querySelector('#mb-in,#mb-out,#mb-reset'),null);
    wheel(main,-100);assert.notEqual(pixels(main),original);
    key(main,'0');assert.equal(pixels(main),original);
    wheel(julia,-100);assert.notEqual(pixels(julia),jOriginal,'Julia wheel zoom works without modifier keys');
    julia.dispatchEvent(new w.MouseEvent('dblclick'));tick();assert.equal(pixels(julia),jOriginal);
    key(julia,'ArrowRight');assert.notEqual(pixels(julia),jOriginal);
    key(julia,'0');assert.equal(pixels(julia),jOriginal);
    for(let i=0;i<3;i++)wheel(main,100);
    const clamped=pixels(main);wheel(main,100);assert.equal(pixels(main),clamped,'zooming at the maximum width preserves the centre');
    main.dispatchEvent(new w.MouseEvent('dblclick'));tick();assert.equal(pixels(main),original);
    for(const [canvas,baseline]of [[main,original],[julia,jOriginal]]){
      pointer(canvas,'pointerdown',1,320,200);pointer(canvas,'pointermove',1,360,200);pointer(canvas,'pointerup',1,360,200);tick();
      assert.notEqual(pixels(canvas),baseline,'dragging pans either plane');key(canvas,'0');assert.equal(pixels(canvas),baseline);
      pointer(canvas,'pointerdown',1,200,200,true);pointer(canvas,'pointerdown',2,440,200,true);pointer(canvas,'pointermove',2,540,200,true);
      pointer(canvas,'pointerup',1,200,200,true);pointer(canvas,'pointerup',2,540,200,true);tick();
      assert.notEqual(pixels(canvas),baseline,'a pinch zooms either plane');key(canvas,'0');assert.equal(pixels(canvas),baseline);
    }
  }finally{
    stop?.();dom.window.close();for(const [key,descriptor]of prior)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
  }
});
