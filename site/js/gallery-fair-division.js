// Gallery entry points reuse the guided experiment, including its direct handles and keyboard controls.
import {mountExperiment} from './lab/mount.js';
export const fairGallery=id=>(host,{lang})=>{const api=mountExperiment(host,id,{mode:'inline',lang});return ()=>api.destroy();};
