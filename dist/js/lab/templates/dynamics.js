// Continuous systems share the retained canvas/cameras/handles of family and the stage scheduler.
import { mount as family } from './family.js';

export function mount(env) {
  const {exp,stage,getState,setState,advance,fmt}=env,base=family(env),abort=new stage.wrap.ownerDocument.defaultView.AbortController();
  const details=document.createElement('details'),summary=document.createElement('summary');
  details.className='lab2-dynamics-settings';summary.textContent=fmt.t(['Paramètres physiques et précision','Physical parameters and precision']);details.append(summary);
  const slots=[];
  for(const spec of exp.settings||[]){
    const label=document.createElement('label'),name=document.createElement('span'),input=document.createElement(spec.options?'select':'input');
    name.textContent=fmt.t(spec.label);label.className='lab2-ctl';label.append(name,input);details.append(label);
    if(spec.options)for(const [value,text]of spec.options){const option=document.createElement('option');option.value=value;option.textContent=fmt.t(text);input.append(option);}
    else{input.type='number';input.min=spec.min;input.max=spec.max;input.step=spec.step;}
    input.addEventListener('change',()=>{let value=spec.options?input.value:Number(input.value);if(!spec.options){if(!Number.isFinite(value))return;value=Math.max(spec.min,Math.min(spec.max,value));}
      setState(spec.set?spec.set(getState(),value):{[spec.key]:value,time:0});stage.invalidate();},{signal:abort.signal});slots.push({spec,input});
  }
  stage.wrap.parentElement.append(details);
  let playing=null;
  function player(c,onChange){
    let stop=null;
    const api={get playing(){return !!stop;},stop(){if(stop){stop();stop=null;onChange?.(false);}},toggle(){
      if(stop)return api.stop();const s=getState(),from=c.get(s)>=c.max?0:c.get(s);
      if(stage.reduced()){advance(c.set(s,Math.min(c.max,from+(c.play?.step??.04))));return;}
      let last=null;advance(c.set(s,from));
      stop=stage.animate(now=>{last??=now;const dt=Math.min(.05,(now-last)/1000);last=now;const current=getState(),value=Math.min(c.max,c.get(current)+dt*(current.speed||1));
        advance(c.set(current,value));const m=exp.model.model({...current,time:value});
        if(value>=c.max||(m.status!=='complete'&&value>=m.path.t)){stop=null;onChange?.(false);return false;}
      });onChange?.(true);
    }};playing=api;return api;
  }
  return {...base,player,draw(g){base.draw(g);const s=getState();for(const {spec,input}of slots){const v=String(spec.get?spec.get(s):s[spec.key]);if(input.value!==v)input.value=v;}},destroy(){playing?.stop();abort.abort();details.remove();base.destroy();}};
}
