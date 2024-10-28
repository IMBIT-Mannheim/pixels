import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";
import { scaleFactor } from "./constants";

export const k = kaplay({
    global: false,
    touchToMouse: true,
    canvas: document.getElementById("game"),
    debug: true, // set to false once ready for production
});