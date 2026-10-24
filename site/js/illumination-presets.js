// Coordinate reconstructions, not copied artwork. Tokarsky coordinates cross-checked against Cmglee's CC BY-SA 3.0
// diagram on Wikimedia Commons; source credit is displayed with the exhibit. Wolecki coordinates measured from the
// original vector Figure 1 in arXiv:1905.09358v3 and reduced to the exact unit 45-degree triangle lattice.
import {line,arc,polygonEdges} from './illumination-model.js';
export const SOURCES={
 penrose:'https://arxiv.org/abs/1703.02268',tokarsky:'https://doi.org/10.1080/00029890.1995.12004679',
 wolecki:'https://arxiv.org/abs/1905.09358v3',lmw:'https://doi.org/10.2140/gt.2016.20.1737',
 coordinateCredit:'https://commons.wikimedia.org/wiki/File:Tokarsky_Castro_illumination_problem.svg',
 penroseGeometry:'https://commons.wikimedia.org/wiki/File:Penrose_unilluminable_room.svg',
};
export const TOKARSKY=[[0,2],[1,2],[1,3],[2,3],[2,4],[3,3],[4,3],[4,4],[5,3],[6,3],[6,4],[7,3],[7,2],[8,2],[8,1],[7,1],[6,0],[6,1],[5,1],[5,2],[3,2],[3,1],[2,1],[2,0],[1,0],[1,1]];
// The repeated (4,4) is intentional: the triangular indentation touches the outer boundary at a vertex.
// It is a singular absorbing corner, never a hole filled by the renderer or a route for a ray to pass through.
export const WOLECKI=[[0,4],[1,3],[2,3],[2,2],[3,2],[3,1],[4,0],[4,1],[5,1],[6,2],[5,2],[5,3],[4,4],[4,3],[3,3],[4,4],[3,4],[3,5],[2,5],[2,6],[1,5],[1,4]];
export const PENROSE=[line([-4,-1],[-4,-.2]),line([-4,-.2],[-5,-.2]),line([-5,-.2],[-5,-1]),arc([0,-1],5,3,Math.PI,Math.PI),line([5,-1],[5,-.2]),line([5,-.2],[4,-.2]),line([4,-.2],[4,-1]),arc([4,0],.5,1,-Math.PI/2,-Math.PI),line([4,1],[4,.2]),line([4,.2],[5,.2]),line([5,.2],[5,1]),arc([0,1],5,3,0,Math.PI),line([-5,1],[-5,.2]),line([-5,.2],[-4,.2]),line([-4,.2],[-4,1]),arc([-4,0],.5,1,Math.PI/2,-Math.PI)];
export const PRESETS={
 penrose:{edges:PENROSE,source:[0,0],target:null,bounds:[-6,6,-5,5]},
 tokarsky:{edges:polygonEdges(TOKARSKY),source:[2,2],target:[6,2],bounds:[-1,9,-1,5]},
 wolecki:{edges:polygonEdges(WOLECKI),source:[2,4],target:[4,2],bounds:[-1,7,-1,7]},
 polygon:{edges:polygonEdges([[-4,-3],[4,-3],[4,3],[-4,3]]),source:[0,0],target:null,bounds:[-6,6,-5,5]},
 curved:{edges:polygonEdges([[-4,-3],[4,-3],[4,3],[-4,3]]),source:[0,0],target:null,bounds:[-6,6,-5,5]},
};
