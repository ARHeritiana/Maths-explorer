// Galois: separate documents, mathematical interpretation and later biographical legends.
const P=(fr,en)=>[fr,en];
export const GALOIS_BIOGRAPHY={
  id:'galois',name:'Évariste Galois',dates:'1811-1832',places:P('France, monarchie de Juillet','France, July Monarchy'),
  topics:['history/people','algebra/equations','algebra/complex'],concepts:['groups','polynomials','quadratic'],
  dek:P('Comprendre les équations à travers les permutations de leurs racines. Une œuvre poursuivie par ses lecteurs.','Understand equations through permutations of their roots. Work carried forward by later readers.'),
  facts:[
    ['1811',P('Naissance le 25 octobre.','Born on 25 October.')],
    ['1829',P('Premier article publié, sur les fractions continues.','First published article, on continued fractions.')],
    ['1831',P('Soumission du mémoire sur la résolution par radicaux.','Submission of the memoir on solution by radicals.')],
    ['29 mai 1832',P('Lettre à Auguste Chevalier : bilan de recherches antérieures.','Letter to Auguste Chevalier: an account of earlier research.')],
    ['31 mai 1832',P('Mort des suites du duel du 30 mai.','Dies from wounds received in the duel of 30 May.')],
    ['1846',P('Liouville publie ses œuvres mathématiques.','Liouville publishes his mathematical works.')],
  ],
  sections:[
    [P('Chercher dans une période troublée','Research in unsettled times'),[
      P('Galois étudie les équations dans la France des révolutions de 1830. Républicain engagé, il connaît l’exclusion de son école et la prison. Ses manuscrits circulent difficilement ; ses recherches ne se réduisent pourtant ni à ces échecs institutionnels, ni à sa mort précoce.',
        'Galois studies equations in the France of the 1830 revolution. A committed republican, he experiences expulsion and imprisonment. His manuscripts circulate with difficulty; neither institutional setbacks nor his early death sum up his research.'),
    ]],
    [P('Des racines aux symétries','From roots to symmetries'),[
      P('Pour x² − 2 = 0, les racines sont √2 et −√2. Dans le corps Q(√2), leur échange conserve les additions, les multiplications et les nombres rationnels. L’identité et cet échange forment un groupe. Pour une équation générale, toutes les permutations des racines ne conservent pas nécessairement leurs relations algébriques.',
        'For x² − 2 = 0, the roots are √2 and −√2. In the field Q(√2), exchanging them preserves addition, multiplication and rational numbers. The identity and this exchange form a group. For a general equation, arbitrary root permutations need not preserve their algebraic relations.'),
      P('Le lien entre ce groupe et la résolution par radicaux devient la théorie de Galois. En langage moderne, un polynôme sur Q est résoluble par radicaux si et seulement si son groupe de Galois est résoluble. Cette propriété de groupe ne signifie pas simplement « commutatif ». Abel avait déjà établi l’absence de formule générale par radicaux au degré cinq ; certaines équations de degré cinq restent résolubles.',
        'The connection between this group and solution by radicals becomes Galois theory. In modern language, a polynomial over Q is solvable by radicals exactly when its Galois group is solvable. This group property does not simply mean “commutative”. Abel had already established that no general radical formula exists in degree five; some quintic equations remain solvable.'),
    ]],
    [P('Ce que la dernière lettre établit','What the final letter establishes'),[
      P('La lettre à Chevalier est datée du 29 mai 1832. Galois y résume des résultats déjà travaillés et demande leur examen. Elle ne prouve pas qu’il aurait inventé toute sa théorie en une seule nuit. Le mémoire de 1831 et les publications de 1830 montrent une recherche antérieure.',
        'The letter to Chevalier is dated 29 May 1832. Galois summarizes earlier results and asks that they be assessed. It does not show that he invented his entire theory in one night. The 1831 memoir and publications from 1830 document earlier research.'),
    ]],
    [P('Le duel et la réception','The duel and its aftermath'),[
      P('Galois est blessé en duel le 30 mai et meurt le lendemain. Les motifs et les participants restent discutés : une intrigue amoureuse précise ou un complot politique ne doivent pas être présentés comme établis. La publication de Liouville en 1846 rend les manuscrits accessibles ; la théorie actuelle résulte aussi du travail d’édition, d’explication et de généralisation qui suit.',
        'Galois is wounded in a duel on 30 May and dies the next day. Motives and participants remain disputed: a specific romantic intrigue or political conspiracy should not be stated as fact. Liouville’s 1846 publication makes the manuscripts accessible; subsequent editing, exposition and generalization also shape the theory taught today.'),
    ]],
  ],
  links:['#chapter/premiere-02','#lab/quadratic','#lab/complex','#history/advances/galois-publication'],
  sources:[
    ['https://mathshistory.st-andrews.ac.uk/Biographies/Galois/',P('Galois : biographie MacTutor','Galois: MacTutor biography')],
    ['https://www.gresham.ac.uk/sites/default/files/the_memoirs_and_legacy_of_evariste_galois.pdf',P('P. M. Neumann : mémoires et postérité (2011)','P. M. Neumann: memoirs and legacy (2011)')],
    ['https://www.numdam.org/item/JMPA_1846_1_11__381_0/',P('Source primaire : œuvres, édition de 1846','Primary source: works, 1846 edition')],
    ['https://www.persee.fr/doc/rhs_0048-7996_1968_num_21_2_2554',P('C. A. Infantozzi : étude documentaire sur sa mort (1968)','C. A. Infantozzi: documentary study of his death (1968)')],
  ],
};
