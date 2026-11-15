// Actual input events exercise the new challenge activities, without running a search in the page.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {activity as knights} from '../site/js/challenges/knights/activity.js';
import {activity as rooms} from '../site/js/challenges/rooms/activity.js';
import {activity as factorials} from '../site/js/challenges/factorials/activity.js';

function fixture(mount, q) {
  const dom = new JSDOM('<div id="root"></div>', {pretendToBeVisual:true});
  globalThis.document = dom.window.document;
  const root = document.querySelector('#root'), t=(fr,en)=>en;
  const stop=mount(root,{q,t,lang:'en',reduced:()=>true});
  return {dom,root,stop,close(){stop();dom.window.close();}};
}
test('knight dragging commits exactly one move and keyboard, undo and touch cancellation work',()=>{
  const f=fixture(knights,{n:8}),{root,dom}=f,w=dom.window;
  const cell=i=>root.querySelector(`[data-cell="${i}"]`);
  cell(0).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  cell(0).dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,clientX:10,clientY:10}));
  cell(17).dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true,clientX:50,clientY:90}));
  cell(17).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.match(root.querySelector('[role=status]').textContent,/2\/64/);
  assert.doesNotMatch(root.querySelector('[role=status]').textContent,/illegal/i);
  cell(17).dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.match(root.querySelector('[role=status]').textContent,/illegal/i);
  root.querySelector('[data-action=undo]').click();
  assert.match(root.querySelector('[role=status]').textContent,/1\/64/);
  const touch=new w.Event('touchstart',{bubbles:true,cancelable:true});cell(0).dispatchEvent(touch);
  assert.equal(touch.defaultPrevented,true,'dragging the current knight keeps finger motion on the board');
  const freeTouch=new w.Event('touchstart',{bubbles:true,cancelable:true});cell(1).dispatchEvent(freeTouch);
  assert.equal(freeTouch.defaultPrevented,false,'other board areas retain page scrolling');
  cell(0).dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,clientX:10,clientY:10}));
  cell(0).dispatchEvent(new w.Event('pointercancel',{bubbles:true}));
  cell(17).dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true,clientX:50,clientY:90}));
  assert.match(root.querySelector('[role=status]').textContent,/1\/64/);
  assert.equal(root.querySelector('[data-search]'),null,'no hint-gated search panel');
  assert.equal(root.querySelector('rect[visibility=visible]'),null,'no legal-move display');
  f.close();
});
test('room traversal, keyboard editing and undo operate without exposing the Euler method',()=>{
  const f=fixture(rooms,{layout:'original'}),{root,dom}=f,w=dom.window;
  const room=i=>root.querySelector(`[data-room="${i}"]`), door=i=>root.querySelector(`[data-door="${i}"]`);
  room(0).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  door(0).dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.match(root.querySelector('[role=status]').textContent,/1\/16/);
  root.querySelector('[data-undo]').click();assert.match(root.querySelector('[role=status]').textContent,/0\/16/);
  assert.doesNotMatch(root.querySelector('[role=status]').textContent,/odd|Euler|possible/i);
  const mode=root.querySelector('select');mode.value='edit';mode.dispatchEvent(new w.Event('change'));
  door(0).dispatchEvent(new w.KeyboardEvent('keydown',{key:' ',bubbles:true}));
  assert.match(root.querySelector('[role=status]').textContent,/0\/15/);   // closing a door removes it from the count
  door(0).dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.match(root.querySelector('[role=status]').textContent,/0\/16/);
  assert.equal(root.querySelectorAll('[data-door]').length,16);assert.equal(root.querySelectorAll('[data-room]').length,6);
  f.close();
});
test('factor removal works and the activity offers no exact calculator or hint views',()=>{
  const f=fixture(factorials,{n:50,p:3,base:10}),{root,dom}=f;
  assert.equal(root.querySelector('form'),null);
  assert.equal(root.querySelector('[data-layers]'),null);
  const nine=[...root.querySelectorAll('[data-factors] button')][8];nine.click();nine.click();
  assert.equal(nine.textContent,'1');assert.match(root.querySelector('[data-count]').textContent,/2/);
  f.close();
});

test('trailing-zero exploration selects relevant base primes and restores factors when changing prime',()=>{
  const f=fixture(factorials,{n:12,p:5,base:12,kind:'zeros'}),{root,dom}=f;
  const select=root.querySelector('[data-prime]');
  assert.deepEqual([...select.options].map(o=>Number(o.value)),[2,3]);
  assert.match(root.querySelector('.act-help').textContent,/divisible by 3/);
  const six=root.querySelectorAll('[data-factors] button')[5];six.click();assert.equal(six.textContent,'2');
  select.value='2';select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(six.textContent,'6');assert.match(root.querySelector('.act-help').textContent,/divisible by 2/);
  six.click();assert.equal(six.textContent,'3');f.close();
});
