// DOM-native chance surface: keyboard/touch cards, stable histogram rows and seeded trials.
// It uses the shared shell lifecycle and dirty-frame scheduler, as the calculation surface does.
export function createStage(host,{onFrame,label}){
 const wrap=document.createElement('div');wrap.className='inference-stage';wrap.tabIndex=0;wrap.setAttribute('role','group');wrap.setAttribute('aria-label',label);host.append(wrap);
 let frame=0,alive=true;
 return {wrap,canvas:null,setHandles(){},reduced:()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,
  invalidate(){if(alive&&!frame)frame=requestAnimationFrame(()=>{frame=0;if(alive)onFrame();});},
  destroy(){alive=false;cancelAnimationFrame(frame);wrap.remove();}};
}
const el=(tag,cls,text='')=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;};
const write=(n,text)=>{if(n.textContent!==text)n.textContent=text;};
export function mount({exp,stage,fmt,getState,setState}){
 const d=exp.inference,t=fmt.t,root=stage.wrap,abort=new stage.wrap.ownerDocument.defaultView.AbortController();
 const on=(n,event,fn)=>n.addEventListener(event,fn,{signal:abort.signal});
 const premise=el('p','inference-assumption',t(d.assumption)),surface=el('div','inference-surface'),status=el('p','inference-status'),formula=el('p','inference-formula',d.formula),stats=el('dl','inference-stats'),chart=el('div','inference-chart'),caution=el('p','inference-caution',t(d.caution));
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');chart.setAttribute('role','table');
 root.append(premise,surface,status,formula,stats,chart,caution);
 const pairs=Array.from({length:8},()=>{const dt=el('dt',''),dd=el('dd','');stats.append(dt,dd);return [dt,dd];});
 const bins=Array.from({length:90},()=>{const row=el('div','inference-bin'),label=el('span','inference-bin-label'),tracks=el('span','inference-tracks'),observed=el('i','inference-observed'),theory=el('i','inference-theory'),value=el('span','inference-bin-value');row.setAttribute('role','row');label.setAttribute('role','rowheader');tracks.setAttribute('aria-hidden','true');value.setAttribute('role','cell');tracks.append(observed,theory);row.append(label,tracks,value);chart.append(row);return {row,label,observed,theory,value};});
 const note=el('p','inference-plot-note');chart.before(note);
 function button(text,fn){const b=el('button','btn btn-secondary',t(text));b.type='button';on(b,'click',fn);surface.append(b);return b;}
 const cells=el('div','inference-cells');surface.append(cells);
 const cards=Array.from({length:100},(_,i)=>{const n=el('span','inference-cell');cells.append(n);return n;});
 let accept,reject,reveal,doors=[],dataset;
 if(exp.id==='secretary'){
  reject=button(['Refuser et continuer','Reject and continue'],()=>{const s=getState();if(s.finished)return;setState(s.interview>=s.n?{accepted:s.n-1,finished:true}:{interview:s.interview+1});});
  accept=button(['Accepter maintenant','Accept now'],()=>{const s=getState();if(!s.finished)setState({accepted:s.interview-1,finished:true});});
 }
 if(exp.id==='tank')reveal=button(['Révéler la population','Reveal population'],()=>setState({revealed:1}));
 if(exp.id==='monty'){
  cells.hidden=true;const board=el('div','inference-doors');surface.prepend(board);
  doors=Array.from({length:3},(_,i)=>{const b=el('button','inference-door');b.type='button';on(b,'click',()=>{const s=getState(),m=exp.model.model(s);if(s.finished||s.opened&&i===m.door)return;setState(s.opened?{strategy:i===s.choice?'stay':'switch',finished:true}:{choice:i});});board.append(b);return b;});
  reveal=button(['Ouvrir une autre porte','Open another door'],()=>{const s=getState();if(!s.opened)setState({opened:true});});
 }
 if(exp.id==='baker')reveal=button(['Peser un pain de plus','Weigh one more loaf'],()=>{const s=getState();setState({n:Math.min(200,s.n+1)});});
 if(exp.id==='birthdays')reveal=button(['Ajouter une personne','Add a person'],()=>{const s=getState();setState({n:Math.min(100,s.n+1)});});
 if(exp.id==='benford'){
  cells.hidden=true;const label=el('label','inference-data-label',t(['Tes nombres, séparés par espaces, points-virgules ou retours à la ligne. Virgule décimale acceptée.','Your numbers, separated by spaces, semicolons or new lines. Decimal commas accepted.']));
  dataset=el('textarea','inference-data');dataset.rows=4;dataset.id=`inference-data-${exp.id}`;label.htmlFor=dataset.id;dataset.placeholder='1.2; 12; 120; 0; -54; 2.99e8';
  const error=el('p','inference-input-error');error.setAttribute('role','status');
  on(dataset,'input',()=>{const tokens=dataset.value.trim().split(/[\s;]+/).filter(Boolean);const values=tokens.map(x=>Number(x.replace(',','.')));const invalid=values.filter(x=>!Number.isFinite(x)).length;write(error,invalid?t(['Valeur non numérique : corrige la saisie.','Nonnumeric value: correct the input.']):'');if(!invalid)setState({mode:'custom',values:values.slice(0,10000)});});surface.append(label,dataset,error);
 }
 const interval=(hits,n)=>{if(!n)return t(['Pas encore','Not yet']);const z=1.959963984540054,p=hits/n,den=1+z*z/n,mid=(p+z*z/(2*n))/den,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return '['+fmt.num(100*Math.max(0,mid-half),2)+' % ; '+fmt.num(100*Math.min(1,mid+half),2)+' %]';};
 const percent=x=>x===null?t(['Pas encore','Not yet']):fmt.read(100*x,2)+' %';
 function showStats(rows){pairs.forEach(([a,b],i)=>{a.hidden=b.hidden=i>=rows.length;if(i<rows.length){write(a,t(rows[i][0]));write(b,String(rows[i][1]));}});}
 function showCards(values,duplicate=false){cards.forEach((n,i)=>{n.hidden=i>=values.length;if(i<values.length){write(n,String(values[i]));n.dataset.match=String(duplicate&&values.indexOf(values[i])!==values.lastIndexOf(values[i]));}});}
 function bars(observed,theory,labels,caption){const hasTheory=theory.length>0;const max=Math.max(0.01,...observed,...theory);bins.forEach((b,i)=>{b.row.hidden=i>=labels.length;if(i<labels.length){write(b.label,String(labels[i]));b.observed.style.width=(100*(observed[i]||0)/max)+'%';b.theory.style.width=(100*(theory[i]||0)/max)+'%';b.theory.hidden=!hasTheory;write(b.value,percent(observed[i]||0)+(hasTheory?' / '+percent(theory[i]||0):''));}});write(note,hasTheory?t(['Plein : observé. Contour : calcul théorique.','Filled: observed. Outline: theoretical calculation.']):t(['Fréquences observées par classe.','Observed frequencies by bin.']));chart.setAttribute('aria-label',caption);}
 const hideChart=()=>{chart.hidden=note.hidden=true;};
 const histogram=(values,min,max,count=15)=>{const out=Array(count).fill(0);for(const v of values){const j=Math.min(count-1,Math.max(0,Math.floor((v-min)/(max-min)*count)));out[j]++;}return out.map(v=>values.length?v/values.length:0);};
 let previous='',growth=0,alive=true;
 const stopGrowth=()=>{if(growth)cancelAnimationFrame(growth);growth=0;};
 if(exp.id==='benford'){const grow=button(['Faire grandir l’échantillon','Grow the sample'],()=>{
  if(growth){stopGrowth();grow.setAttribute('aria-pressed','false');return;}
  if(stage.reduced()){setState({count:Math.min(5000,getState().count+1)});return;}
  grow.setAttribute('aria-pressed','true');let last=0;
  const step=now=>{if(!alive||stage.reduced()){stopGrowth();grow.setAttribute('aria-pressed','false');return;}
   if(now-last>100){last=now;const s=getState();if(s.mode==='real'||s.mode==='custom'||s.count>=5000){stopGrowth();grow.setAttribute('aria-pressed','false');return;}setState({count:Math.min(5000,s.count+10)});}
   growth=requestAnimationFrame(step);};growth=requestAnimationFrame(step);
 });grow.setAttribute('aria-pressed','false');}

 return {handles:[],draw(){
  const s=getState(),key=JSON.stringify(s);if(key===previous)return;previous=key;const m=exp.model.model(s);chart.hidden=note.hidden=false;
  if(exp.id==='secretary'){
   showCards(s.finished?m.order:m.relative);accept.disabled=reject.disabled=s.finished;write(status,s.finished?t(['Classement final révélé. Qualité choisie : ','Final ranking revealed. Selected quality: '])+m.selected+'/'+s.n+(m.selected===s.n?t(['. Meilleur candidat !','. Best candidate!']):''):t(['Entretien ','Interview '])+s.interview+'/'+s.n+t(['. Rang du candidat actuel parmi les personnes vues : ','. Current candidate’s rank among those seen: '])+m.relative.at(-1));
   showStats([[['Seuil testé r','Tested threshold r'],Math.min(s.n-1,s.skip)],[['Succès théorique','Theoretical success'],percent(m.probability)],[['Meilleur seuil entier','Best integer threshold'],m.optimum.skip],[['Succès au meilleur seuil','Success at best threshold'],percent(m.optimum.probability)],[['Fréquence simulée','Simulated frequency'],percent(m.frequency)],[['Succès / essais','Wins / trials'],m.hits+' / '+m.runs],[['IC Wilson des simulations (95 %, approché)','Simulation Wilson CI (95%, approximate)'],interval(m.hits,m.runs)]]);
   bars(Array.from({length:Math.min(s.n,100)},(_,i)=>i===Math.min(s.n-1,s.skip)?m.frequency||0:0),Array.from({length:Math.min(s.n,100)},(_,i)=>{let z=0;if(i===0)return 1/s.n;for(let j=i;j<s.n;j++)z+=1/j;return i*z/s.n;}),Array.from({length:Math.min(s.n,100)},(_,i)=>i),t(['Probabilité exacte selon le nombre de refus initiaux','Exact probability by initial rejection count']));
  }
  if(exp.id==='tank'){
   showCards(m.sample);write(status,t(['Numéros observés. Modifie ton estimation avant de révéler N.','Observed serials. Change your guess before revealing N.']));reveal.disabled=!!s.revealed;
   showStats([[['Maximum m','Maximum m'],m.m],[['Ton estimation','Your guess'],s.guess],[['Estimateur sans biais','Unbiased estimator'],fmt.read(m.estimate,2)],[['Intervalle unilatéral à 95 %','One-sided 95% interval'],'['+m.m+' ; '+m.upper+']'],[['Population N','Population N'],s.revealed?String(s.N):t(['Cachée','Hidden'])],[['Moyenne répétée de N̂','Repeated mean of N̂'],m.observedMean===null?t(['Pas encore','Not yet']):fmt.read(m.observedMean,2)],[['Écart type théorique','Theoretical standard deviation'],s.revealed?fmt.read(Math.sqrt(m.variance),2):t(['Après révélation','After reveal'])]]);
   if(!s.revealed)hideChart();else{const observed=histogram(m.estimates,0,s.N*2,20);bars(observed,[],Array.from({length:20},(_,i)=>fmt.num((i+.5)*s.N/10)),t(['Distribution des estimations répétées','Distribution of repeated estimates']));write(note,t(['Classes de N̂. Le maximum brut M sous-estime en moyenne ; N̂ est sans biais sous le modèle.','Bins of N̂. The raw maximum M underestimates on average; N̂ is unbiased under the model.']));}
  }
  if(exp.id==='benford'){
   showStats([[['Valeurs valides','Valid values'],m.n],[['Valeurs exclues','Excluded values'],m.excluded],[['χ² descriptif','Descriptive χ²'],m.chiSquare===null?'':fmt.read(m.chiSquare,3)],[['Tous les effectifs attendus ≥ 5 ?','All expected counts ≥ 5?'],t(m.chiSquareUsable?['Oui, vérifier aussi l’indépendance','Yes, also check independence']:['Non : approximation du test fragile','No: test approximation is fragile'])]]);
   write(status,s.mode==='real'?t(['Données réelles BIPM : ΔνCs, c, h, e, k, NA, Kcd, dans leurs unités SI de définition. Petit choix contraint, pas un échantillon représentatif.','Real BIPM data: ΔνCs, c, h, e, k, NA, Kcd in their defining SI units. A small constrained selection, not a representative sample.']):t(['Aucun résultat ici ne prouve une fraude ou une authenticité.','No result here proves fraud or authenticity.']));
   bars(m.frequency,m.theory,m.counts.map((_,i)=>i+(s.digits===1?1:10)),t(['Chiffres significatifs : fréquences et loi de Benford','Leading digits: frequencies and Benford law']));
  }
  if(exp.id==='baker'){
   showCards(m.weights.slice(-30).map(x=>fmt.num(x,1)+' g'));
   write(status,t(m.validIID?['Prélèvement indépendant : modèle normal de variance connue.','Independent sampling: normal model with known variance.']:['Sélection du plus lourd : intervalle et test naïfs non calibrés.','Heaviest selected: naive interval and test are not calibrated.']));
   showStats([[['Moyenne observée (g)','Observed mean (g)'],fmt.read(m.average,2)],[['Cible (g)','Target (g)'],s.target],[['SE naïf (g)','Naive SE (g)'],fmt.read(m.se,2)],[['Intervalle naïf à 95 % (g)','Naive 95% interval (g)'],m.ci.map(x=>fmt.num(x,2)).join(' ; ')],[['p-valeur unilatérale naïve','Naive one-sided p-value'],fmt.read(m.p,4)],[['Puissance théorique iid','Theoretical iid power'],m.validIID?percent(m.power):t(['Non applicable','Not applicable'])],[['Rejets / répétitions','Rejections / repetitions'],m.rejections+' / '+m.runs],[['Couverture répétée','Repeated coverage'],percent(m.coverageRate)]]);
   bars(histogram(m.weights,900,1100,20),[],Array.from({length:20},(_,i)=>905+i*10),t(['Histogramme des masses en grammes','Histogram of weights in grams']));write(note,t(['Histogramme des masses, classes de 10 g (extrêmes regroupés).','Weight histogram, 10 g bins (extremes grouped).']));
  }
  if(exp.id==='birthdays'){
   showCards(m.sample.map(x=>x+1),true);write(status,t(m.duplicate?['Collision présente dans ce groupe.','Collision in this group.']:['Aucune collision dans ce groupe.','No collision in this group.']));
   showStats([[['Probabilité exacte','Exact probability'],percent(m.probability)],[['Nombre moyen de paires','Expected matching pairs'],fmt.read(m.expectedPairs,3)],[['Collisions / essais','Collisions / trials'],m.hits+' / '+m.runs],[['Fréquence simulée','Simulated frequency'],percent(m.frequency)],[['IC Wilson des simulations (95 %, approché)','Simulation Wilson CI (95%, approximate)'],interval(m.hits,m.runs)]]);bars([m.frequency||0,1-(m.frequency||0)],[m.probability,1-m.probability],[t(['Collision','Collision']),t(['Sans collision','No collision'])],t(['Collision : fréquence et probabilité','Collision: frequency and probability']));
  }
  if(exp.id==='monty'){
   doors.forEach((b,i)=>{const opened=s.opened&&i===m.door,finished=s.finished||opened&&!m.valid;write(b,t(['Porte ','Door '])+(i+1)+' '+(opened||finished?i===m.prize?t(['Prix','Prize']):t(['Chèvre','Goat']):'?')+(i===s.choice?t([' (choisie)',' (chosen)']):''));b.disabled=!!finished||!!opened;b.setAttribute('aria-pressed',String(i===s.choice));});
   reveal.disabled=!!s.opened;write(status,!s.opened?t(['Choisis une porte, puis demande une révélation.','Choose a door, then ask for a reveal.']):!m.valid?t(['Le prix est révélé : cette partie est exclue du dénominateur conditionnel.','Prize revealed: this game is excluded from the conditional denominator.']):s.finished?t(m.win?['Gagné !','You win!']:['Perdu.','You lose.']):t(['Touche la porte choisie pour rester, ou l’autre porte fermée pour changer.','Tap the chosen door to stay, or the other closed door to switch.']));
   showStats([[['Probabilité conditionnelle exacte','Exact conditional probability'],percent(m.probability)],[['Probabilité d’une chèvre révélée','Probability of a goat reveal'],percent(m.eligibleProbability)],[['Gains / chèvres révélées','Wins / goat reveals'],m.wins+' / '+m.eligible],[['Parties commencées','Games started'],m.runs],[['Fréquence conditionnelle','Conditional frequency'],percent(m.frequency)],[['IC Wilson des simulations (95 %, approché)','Simulation Wilson CI (95%, approximate)'],interval(m.wins,m.eligible)]]);bars([m.frequency||0],[m.probability],[t(['Gagner','Win'])],t(['Gains conditionnés sur une chèvre révélée','Wins conditioned on a goat reveal']));
  }
 },destroy(){alive=false;stopGrowth();abort.abort();}};
}
