// The gallery and guided topology laboratory inspect the same models and camera.
import {mountExperiment} from './lab/mount.js';
export const topologyGallery=id=>(root,{lang})=>{const api=mountExperiment(root,id,{mode:'inline',lang});return ()=>api.destroy();};
