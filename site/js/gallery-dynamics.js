// Gallery and guided missions use exactly the same simulation, cameras and physical settings.
import { mountExperiment } from './lab/mount.js';
export const dynamicsGallery=id=>(root,{lang})=>{const api=mountExperiment(root,id,{mode:'inline',lang});return()=>api.destroy();};
