// One device-local class preference shared by the home, courses, practice and slides.
import {liveCourses} from './live-curriculum.js';
const valid=id=>liveCourses.some(c=>c.id===id);
export function currentCourse(fallback='',context=globalThis) {
 try {const id=context.localStorage.getItem('mx-home-course');if(valid(id))return id;}catch{}
 try {const id=context.sessionStorage.getItem('mx-course');if(valid(id))return id;}catch{}
 return valid(fallback)?fallback:'';
}
export function rememberCourse(id,context=globalThis) {
 if(id!==''&&!valid(id))return;
 const changed=currentCourse('',context)!==id;
 try {if(id)context.localStorage.setItem('mx-home-course',id);else context.localStorage.removeItem('mx-home-course');}catch{}
 try {if(id)context.sessionStorage.setItem('mx-course',id);else context.sessionStorage.removeItem('mx-course');}catch{}
 if(changed&&typeof context.CustomEvent==='function')context.dispatchEvent?.(new context.CustomEvent('mx-course-change',{detail:id}));
}
