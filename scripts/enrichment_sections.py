def sections(p,kind,j):
 if kind=='notes':
  return [(('Avant de commencer','Before you begin')[j],[p['prerequisites'][j]]), (('Idées et méthode','Ideas and method')[j],[q[j] for q in p['lesson']]),(('Exemple expliqué','Worked example')[j],[p['worked'][j]]),(('À explorer','Explore')[j],[p['activity'][j]])]
 if kind=='exercises':return ([(('Données','Given information')[j],[p['exerciseContext'][j]])] if p.get('exerciseContext') else [])+ [(('Exercice ','Exercise ')[j]+str(i+1),[x['q'][j]]) for i,x in enumerate(p['exercises'])]
 if kind=='problems':return ([(('Données','Given information')[j],[p['problemContext'][j]])] if p.get('problemContext') else [])+ [(('Chercher, justifier, conclure','Investigate, justify, conclude')[j],[p['problem'][j]])]
 return ([(('Données des exercices','Exercise data')[j],[p['exerciseContext'][j]])] if p.get('exerciseContext') else [])+[(('Exercice ','Exercise ')[j]+str(i+1),[x['q'][j],x['a'][j]]) for i,x in enumerate(p['exercises'])]+[(('Problème : raisonnement complet','Problem: complete reasoning')[j],(([p['problemContext'][j]] if p.get('problemContext') else [])+[p['problem'][j],p['solution'][j]]))]
