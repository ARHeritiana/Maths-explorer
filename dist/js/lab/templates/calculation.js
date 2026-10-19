// Formula-only experiment surface: native MathML, exact values and prime factors. No drawing or gesture interception.
const NS = 'http://www.w3.org/1998/Math/MathML';
const node = (tree) => {
  const [tag,...children] = tree, el = document.createElementNS(NS,tag);
  for(const child of children)el.append(Array.isArray(child)?node(child):document.createTextNode(String(child)));
  return el;
};
export function createStage(host,{onFrame,label}){
  const wrap=document.createElement('div');wrap.className='lab2-calculation';wrap.tabIndex=0;
  wrap.setAttribute('role','group');wrap.setAttribute('aria-label',label);host.append(wrap);
  let frame=0,alive=true;
  return {wrap,canvas:null,setHandles(){},reduced:()=>true,
    invalidate(){if(alive&&!frame)frame=requestAnimationFrame(()=>{frame=0;if(alive)onFrame();});},
    destroy(){alive=false;cancelAnimationFrame(frame);wrap.remove();},
  };
}
export function mount({exp,stage,fmt,getState}){
  const expression=document.createElementNS(NS,'math');expression.setAttribute('display','block');
  const value=document.createElement('p');value.className='lab2-number-value';
  const factors=document.createElementNS(NS,'math');factors.setAttribute('display','block');
  const kind=document.createElement('p');kind.className='lab2-number-kind';
  stage.wrap.append(expression,value,factors,kind);
  let key='';
  return {handles:[],draw(){
    const d=exp.views.calculation(getState(),{fmt}),next=JSON.stringify(d);if(key===next)return;key=next;
    expression.replaceChildren(node(d.expression));
    value.textContent='= '+fmt.full(d.value);
    factors.hidden=d.prime;factors.setAttribute('style',d.prime?'display:none':'display:block');
    const terms=d.factors.flatMap(([p,k],i)=>[...(i?[["mo","×"]]:[]),k>1?["msup",["mn",fmt.full(p)],["mn",k]]:["mn",fmt.full(p)]]);
    factors.replaceChildren(node(['mrow',['mn',fmt.full(d.value)],['mo','='],...terms]));
    kind.dataset.prime=String(d.prime);kind.textContent=fmt.t(d.prime?['Nombre premier','Prime number']:['Nombre composé','Composite number']);
  },destroy(){}};
}
