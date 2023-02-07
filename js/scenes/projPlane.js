import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;

let project_plane = (ball, plane) => {
    return cg.mMultiply(cg.mInverse(plane), ball).slice(12, 15)
}

let cube;
let ball;
export const init = async model => {
    t = model.time
    cube = model.add("cube").move(1, 2, 0).scale(.1)
    ball = model.add("sphere").move(1, 2, -1).scale(.1)
    model.animate(() => {
        let new_time = model.time
        dt = new_time - t;
        t = new_time;
        console.log(project_plane(ball.getMatrix(), cube.getMatrix()))
    });
}

