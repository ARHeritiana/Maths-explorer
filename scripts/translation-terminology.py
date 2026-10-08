"""Context-aware mathematical terminology corrections for the English editions.

These corrections supplement the cached machine translation; they do not claim
an exhaustive editorial review. Preserve technical distinctions such as a
recurrence relation versus a proof by induction and a rectangle versus a right
triangle.
"""
import re

EXACT = {
    'Suites numériques': 'Numerical sequences',
    'Suites numériques et récurrence': 'Sequences and mathematical induction',
    'Récurrence': 'Mathematical induction',
    'Pour tout': 'For every', 'pour tout': 'for every',
    'Pour tous': 'For all', 'pour tous': 'for all',
    'Pour toute': 'For every', 'pour toute': 'for every',
    'à': 'to', 'À': 'To',
    'est l’unique réel': 'is the unique real number',
    'et tout naturel': 'and every natural number',
    'équivaut à': 'is equivalent to',
    'Pour': 'For',
    'croissante.': 'increasing.', 'croissante et': 'increasing and',
    'décroissante sur': 'decreasing on',
    'décroissance. De': 'decrease. From',
    'normes.': 'norms.',
    'en repère': 'in coordinates', 'même repère.': 'same coordinate system.',
    'repère du plan.': 'coordinate system in the plane.',
    'milieu est': 'midpoint is', 'Milieu de': 'Midpoint of', 'Milieu (0;': 'Midpoint (0;',
    '6; 1). 2. Milieu de [': '6; 1). 2. Midpoint of [',
    '2. Calculer la norme de (3;': '2. Calculate the norm of (3;',
    '2. La norme de (': '2. The norm of (',
    'a l’image de 3': 'maps to the value 3',
    '6–15 octobre : 8 h': '6–15 October: 8 hours',
    '22 septembre–1er octobre : 8 h': '22 September–1 October: 8 hours',
    '8–17 septembre : 8 h, puis reprises': '8–17 September: 8 hours, then review',
    'Le parcours du chapitre': 'Chapter overview',
    'Parcours du chapitre': 'Chapter overview',
    'Avant de commencer – Reprises et écriture indiquées': 'Before you begin – Review and written work',
    'Reprises ciblées après le diagnostic': 'Targeted review after the diagnostic check',
    'Après le diagnostic.': 'After the diagnostic check.',
    'Diagnostic : six questions, 10 minutes': 'Diagnostic check: six questions, 10 minutes',
    'diagnostic ne donne pas lieu à une note.': 'diagnostic check is not graded.',
    'Énoncé': 'Problem', 'Énoncés': 'Problems', 'Oral et logique.': 'Speaking and reasoning.',
    'Exemple rédigé': 'Worked example',
    'Dans un triangle rectangle, un angle a pour côtés adjacent 3 et hypoténuse 5. Donner son cosinus.': 'In a right triangle, an angle has adjacent side 3 and hypotenuse 5. Find its cosine.',
    'Vecteurs, Chasles, Pythagore, cosinus dans un triangle rectangle, repère orthonormé.': 'Vectors, Chasles’ relation, Pythagoras, cosine in a right triangle, orthonormal coordinates.',
    'Soient A=(-1;0;0) et B=(1;0;0). Leur milieu est O. Pour M=(x;y;z),': 'Let A=(-1;0;0) and B=(1;0;0). Their midpoint is O. For M=(x;y;z),',
    'Le milieu est I=(1;1;0) et un normal est (2;2;0). Le lieu est le plan de point I et de ce': 'The midpoint is I=(1;1;0) and a normal vector is (2;2;0). The locus is the plane through I with this',
    '1. Donner le milieu de AB et une normale à sa médiatrice.': '1. Find the midpoint of AB and a normal vector to its perpendicular bisector.',
    'Hypoténuse d’un triangle rectangle de côtés 5 et 12 ?': 'Hypotenuse of a right triangle with legs 5 and 12?',
    'partout, elle est constante. Une dérivée strictement positive entraîne une stricte croissance. Si': 'everywhere, it is constant. A strictly positive derivative implies strict increase. If',
    'La première tend vers 0 par linéarité et croissances comparées. Pour la seconde,': 'The first tends to 0 by linearity and comparison of growth rates. For the second,',
    ', qui tend vers 0 par croissance comparée. L’exponentielle domine toute puissance': ', which tends to 0 by comparison of growth rates. The exponential dominates every power',
    'Pour chaque seuil, un terme le dépasse ; tous les suivants aussi par croissance. C’est la définition': 'For every threshold, a term exceeds it, as do all later terms since the sequence is increasing. This is the definition',
    'être non nul ; un nombre placé sous une racine carrée doit être positif ou nul. Respecter aussi tout': 'be nonzero; a number under a square root must be nonnegative. Also respect every',
    'croissance comparée. Pour': 'comparison of growth rates. For',
    'réels.': 'real numbers.', 'entiers naturels': 'natural numbers',
}

def correct_translation(source, text):
    if source in EXACT:
        return EXACT[source]
    substitutions = {}
    if re.search(r'suites? numériques?', source, re.I):
        substitutions.update({'digital sequence': 'numerical sequence', 'digital sequences': 'numerical sequences'})
    if re.search(r'sécantes?', source, re.I):
        substitutions.update({'splits': 'secants', 'split': 'secant', 'digital': 'numerical'})
    if re.search(r'\bnormes?\b', source, re.I):
        substitutions.update({'standard': 'norm', 'standards': 'norms'})
    if re.search(r'repère', source, re.I) and not re.search(r'annuel|repère de temps', source, re.I):
        substitutions.update({'marker': 'coordinate system', 'landmark': 'coordinate system', 'mark': 'coordinate system', 'orthonormous': 'orthonormal', 'orthonormized': 'orthonormal'})
    if re.search(r'coordonnées', source, re.I):
        substitutions.update({'contact information': 'coordinates'})
    if re.search(r'triangle rectangle', source, re.I):
        substitutions.update({'rectangle triangle': 'right triangle', 'triangle rectangle': 'right triangle', 'isocele': 'isosceles'})
    if re.search(r'est rectangle en|rectangle en', source, re.I):
        substitutions.update({'rectangle in': 'right-angled at'})
    if re.search(r'\bmilieu[x]?\b', source, re.I) and not re.search(r'terme du milieu|au milieu', source, re.I):
        substitutions.update({'mediums': 'midpoints', 'medium': 'midpoint', 'middle': 'midpoint', 'media': 'midpoints'})
    if re.search(r'\blieu\b', source, re.I) and not re.search(r'au lieu|a lieu|ont lieu|donne.*lieu', source, re.I):
        substitutions.update({'place': 'locus'})
    if re.search(r'parabole', source, re.I):
        substitutions.update({'parable': 'parabola'})
    if re.search(r'antécédents?', source, re.I):
        substitutions.update({'history': 'preimage', 'background': 'preimages'})
    if re.search(r'\bcroissante?\b', source, re.I):
        substitutions.update({'growing': 'increasing', 'growth': 'increasing'})
    if re.search(r'\bdécroissante?\b', source, re.I):
        substitutions.update({'declining': 'decreasing', 'descending': 'decreasing'})
    if re.search(r'\breprises?\b', source, re.I):
        substitutions.update({'recovery': 'review', 'resumption': 'review', 'resume': 'review'})
    if re.search(r'bilan', source, re.I):
        substitutions.update({'balance sheet': 'review'})
    if re.search(r'par récurrence|une récurrence|hypothèse de récurrence', source, re.I):
        substitutions.update({'recurrence': 'induction', 'a induction': 'an induction'})
    substitutions.update({'cosinus': 'cosine', 'sinus': 'sine'})
    for old,new in substitutions.items():
        text = re.sub(r'\b'+re.escape(old)+r'\b', lambda m:new.capitalize() if m[0][0].isupper() else new, text, flags=re.I)
    return text
