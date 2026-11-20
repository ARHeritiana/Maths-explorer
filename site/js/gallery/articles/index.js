// Registry of the encyclopedia articles of the gallery (one module per batch, each exports a map id -> article; see
// ../article.js for the shape). A curiosity without an article still shows the older page.
import { LIFE_ARTICLES } from "./pilot.js";
export const ARTICLES = { ...LIFE_ARTICLES };
