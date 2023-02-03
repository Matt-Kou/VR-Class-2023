import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -.981, 0];
let rebounce = .8
let ball_list = []
let physics = (obj) => {
    console.log("ball", obj.index, "location:", obj.loc)
    console.log("distance:", cg.distance(ball_list[0].loc, ball_list[1].loc))
    let vp = cg.add(cg.scale(g, dt), obj.v)
    obj.loc = cg.add(obj.loc, cg.scale(cg.mix(obj.v, vp, .5), dt))
    obj.v = vp
    for (const obj2 of ball_list) {
        if (obj2.index >= obj.index) {
            break;
        }
        // if (obj2 === obj) {
        //     console.log("error!!!")
        // }
        const distance = obj.scale + obj2.scale - cg.distance(obj.loc, obj2.loc)
        if (distance > 0) {
            const norm = cg.normalize(cg.subtract(obj.loc, obj2.loc))
            const projection = cg.dot(obj.v, norm)
            const direction = cg.scale(norm, -2 * rebounce * projection)
            obj.v = cg.add(obj.v, direction)
            obj2.v = cg.add(obj2.v, cg.scale(norm, 2 * rebounce * projection))
        }
    }
    if (obj.loc[1] < 0.) {
        obj.v[1] = -obj.v[1] * rebounce
        obj.loc[1] = 0.
    }

    obj.setMatrix(cg.mMultiply(cg.mTranslate(obj.loc), cg.mScale(obj.scale)))
}
export const init = async model => {
    let ball = model.add('sphere').color(1,0,0);
    ball.loc = [0.02, 1.5, 0]
    ball.v = [0, 0, 0]
    ball.scale = .1
    ball.setMatrix(cg.mMultiply(ball.loc, cg.mScale(.2)))
    ball.index = 0
    ball_list.push(ball)

    ball = model.add('sphere');
    ball.loc = [0, 2, 0]
    ball.v = [0, 0, 0]
    ball.scale = .1
    ball.setMatrix(cg.mMultiply(ball.loc, cg.mScale(.2)))
    ball.index = 1
    ball_list.push(ball)

    t = Date.now() / 1000
    model.animate(() => {
        // model.turnY(3.14/2)
        let new_time = Date.now() / 1000
        dt = new_time - t;
        t = new_time;
        for (const ball of ball_list) {
            physics(ball)
        }

    });
}

