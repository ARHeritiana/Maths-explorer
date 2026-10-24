// The gallery and guided laboratory mount the same inference model and controls.
import { mountExperiment } from './lab/mount.js';
export const inferenceGallery = id => (root,{lang}) => {
 const api=mountExperiment(root,id,{mode:'inline',lang});
 return ()=>api.destroy();
};
