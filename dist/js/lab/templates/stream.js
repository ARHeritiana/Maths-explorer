// One user-started sampling clock. A trial joins the tally only when its drop/draw finishes.
export function samplingStream({exp,stage,getState,advance}){
  let cancel=null,last=null,progress=null,rate=5;
  const api={onChange:null,get progress(){return progress;},get playing(){return !!cancel;},get rate(){return rate;},
    setRate(value){rate=Math.max(1,Math.min(60,Number(value)||1));},
    stop(){if(cancel)cancel();cancel=null;last=null;progress=null;api.onChange?.(false);stage.invalidate();},
    toggle(){
      if(cancel)return api.stop();
      if(getState().runs>=exp.model.MAX_RUNS)return;
      if(stage.reduced()){advance({runs:getState().runs+1});stage.invalidate();return;}
      progress=0;last=null;
      cancel=stage.animate(now=>{
        if(stage.reduced()){api.stop();return false;}
        if(document.hidden){last=now;return true;}
        if(last===null)last=now;
        const elapsed=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
        const total=progress+elapsed*rate,completed=Math.floor(total);
        progress=total-completed;
        if(completed)advance({runs:Math.min(exp.model.MAX_RUNS,getState().runs+completed)});
        if(getState().runs>=exp.model.MAX_RUNS){api.stop();return false;}
        return true;
      });
      api.onChange?.(true);stage.invalidate();
    },
  };
  return api;
}
