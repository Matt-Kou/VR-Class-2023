import {controllerMatrix, buttonState, joyStickState, time} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let physics = (ball, g) => {
    if (g === undefined) g = [0, -.981, 0]
    let vp = cg.add(ball.v, cg.scale(g, dt))
    ball.move(cg.scale(cg.mix(ball.v, vp, .5), dt))
    ball.v = vp
    let loc = ball.getGlobalMatrix().slice(12, 15)
    if (loc[1] < 0) {
        ball.v = cg.scale(ball.v, -1)
        ball.move(0, cg.scale(loc[1], -1), 0)
    }
    console.log(loc)
}
export const init = async model => {
    let ball = model.add()
    ball.add('sphere').scale(.15);
    // let ball = model.add('sphere').color(1, 0, 0).move(0, 0, 0);
    // model.add('sphere');
    ball.v = [0, 0, 0]
    t = Date.now() / 1000
    model.move(0, 1.5, 0).animate(() => {
        let new_time = Date.now() / 1000
        dt = new_time - t;
        t = new_time;
        physics(ball);
    });
}

