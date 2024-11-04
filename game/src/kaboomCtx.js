import kaplay from "kaplay";
import { scaleFactor } from "./constants";

export const k = kaplay({
    global: false,
    touchToMouse: true,
    canvas: document.getElementById("game"),
    debug: true, // set to false once ready for production
});