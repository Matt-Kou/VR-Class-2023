import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0];
let rebounce = .8
let physics = (obj) => {
    let vp = cg.add(cg.scale(g, dt), obj.v)
    obj.loc = cg.add(obj.loc, cg.scale(cg.mix(obj.v, vp, .5), dt))
    obj.v = vp
    if (obj.loc[1] < 0.) {
        obj.v[1] = -obj.v[1] * rebounce
        obj.loc[1] = 0.
    }
    obj.setMatrix(cg.mMultiply(cg.mTranslate(obj.loc), cg.mScale(obj.scale)))
}
export const init = async model => {
    model.turnY(3.14 / 2);
    let ball = model.add('sphere');
    ball.loc = [0, 1.5, 0]
    ball.v = [0, 0, 0]
    ball.scale = .1
    ball.setMatrix(cg.mMultiply(ball.loc, cg.mScale(.2)))
    t = Date.now() / 1000
    model.animate(() => {
        let new_time = Date.now() / 1000
        dt = new_time - t;
        t = new_time;
        physics(ball)

    });
}

