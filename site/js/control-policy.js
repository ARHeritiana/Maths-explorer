// A selector represents a choice. Keep its value/handlers when only a label is needed.
export function installControlPolicy(root) {
  const labels=new Map();
  const scan=()=>{
    for(const [select,label] of labels)if(!root.contains(select)){label.remove();labels.delete(select);}
    for(const select of root.querySelectorAll('select')){
      const choices=[...select.options].filter(o=>!o.disabled&&!o.hidden&&!o.closest('optgroup[disabled],optgroup[hidden]'));
      let label=labels.get(select);
      if(choices.length<=1){
        if(choices.length===1&&select.selectedOptions[0]!==choices[0]){select.value=choices[0].value;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));return;}
        if(!label){label=document.createElement('span');label.className='select-value';select.after(label);labels.set(select,label);}
        const value=choices[0]?.label||'';if(label.textContent!==value)label.textContent=value;
        if(!select.hidden)select.hidden=true;
      }else if(label){select.hidden=false;label.remove();labels.delete(select);}
    }
  };
  const observer=new MutationObserver(scan);observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','hidden','label']});root.addEventListener('change',scan);scan();
  return()=>{observer.disconnect();root.removeEventListener('change',scan);for(const [select,label]of labels){select.hidden=false;label.remove();}};
}
