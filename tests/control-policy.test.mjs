import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {installControlPolicy} from '../site/js/control-policy.js';
import {svgNavigation,canvasNavigation} from '../site/js/canvas-navigation.js';
import {preferredLanguage,routeLanguage} from '../site/js/content-language.js';
const setup=html=>{const dom=new JSDOM(html,{pretendToBeVisual:true});for(const k of ['document','MutationObserver','Event','CustomEvent'])globalThis[k]=dom.window[k];return dom;};
const tick=()=>new Promise(r=>setTimeout(r,0));
test('singleton menus choose their sole value and reappear when choices grow',async()=>{
 const dom=setup('<main><select><option disabled selected value="">Choose</option><option value="one">One</option></select></main>'),root=document.querySelector('main'),select=document.querySelector('select');let changes=0;select.onchange=()=>changes++;
 const stop=installControlPolicy(root);await tick();assert.equal(select.value,'one');assert.equal(changes,1);assert.equal(select.hidden,true);assert.equal(root.querySelector('.select-value').textContent,'One');
 select.insertAdjacentHTML('beforeend','<option value="two">Two</option>');await tick();assert.equal(select.hidden,false);assert.equal(root.querySelector('.select-value'),null);stop();dom.window.close();
});
test('SVG camera keeps editor pointer events and supports direct zoom, pinch, keys and reset',()=>{
 const dom=setup('<main><svg viewBox="0 0 640 400"><circle data-id="point"/></svg></main>'),svg=document.querySelector('svg');svg.getBoundingClientRect=()=>({left:0,top:0,width:640,height:400});let picked=0;svg.addEventListener('pointerdown',()=>picked++);const stop=svgNavigation(svg);
 const pointer=(target,type,id,x,y)=>{const e=new dom.window.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,button:0});target.dispatchEvent(e);};
 pointer(svg.querySelector('circle'),'pointerdown',1,100,100);assert.equal(picked,1);
 pointer(svg,'pointerdown',2,200,100);pointer(svg,'pointermove',2,300,100);assert.ok(+svg.getAttribute('viewBox').split(' ')[2]<640);pointer(svg,'pointerup',1,100,100);pointer(svg,'pointerup',2,300,100);
 svg.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'0',bubbles:true}));assert.equal(svg.getAttribute('viewBox'),'0 0 640 400');
 svg.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,bubbles:true}));assert.notEqual(svg.getAttribute('viewBox'),'0 0 640 400');
 svg.dispatchEvent(new dom.window.MouseEvent('dblclick',{bubbles:true}));assert.equal(svg.getAttribute('viewBox'),'0 0 640 400');assert.equal(document.querySelectorAll('.canvas-navigation button').length,0);stop();dom.window.close();
});
test('canvas keyboard camera preserves the mathematical coordinate transform',()=>{
 const dom=setup('<main><canvas width="640" height="400"></canvas></main>'),c=document.querySelector('canvas');c.getBoundingClientRect=()=>({left:0,top:0,width:640,height:400});const g={clearRect(){},setTransform(){},save(){},restore(){}};const view=canvasNavigation(c,g,()=>[640,400],()=>{});
 c.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'+',bubbles:true}));assert.equal(view.camera.scale,1.25);
 c.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,bubbles:true}));const p=[120,80],screen=view.camera.project(p);assert.deepEqual(view.point({clientX:screen[0],clientY:screen[1]}),p);
 c.dispatchEvent(new dom.window.MouseEvent('dblclick'));assert.equal(view.camera.scale,1);view.destroy();dom.window.close();
});
test('curricula choose their content language while neutral pages retain preference',()=>{
 assert.equal(preferredLanguage(undefined,['de-DE','en-GB']),'en');assert.equal(preferredLanguage('fr',['en']),'fr');
 const chapters=[{id:'seconde-01',course:'seconde'}];for(const page of ['chapter','library'])assert.equal(routeLanguage({page,id:'seconde-01'},chapters,'en'),'fr');
 assert.equal(routeLanguage({page:'workshop',id:'quadratic'},chapters,'en'),'fr');assert.equal(routeLanguage({page:'home'},chapters,'en'),'en');
});
