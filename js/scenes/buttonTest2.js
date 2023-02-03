import {controllerMatrix, buttonState, joyStickState, time} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
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


let left_not_pressing = () => {
    for (const button of buttonState.left) {
        if (button.pressed) {
            return false;
        }
    }
    return true;
}

let right_not_pressing = () => {
    for (const button of buttonState.right) {
        if (button.pressed) {
            return false;
        }
    }
    return true;
}

export const init = async model => {
    let pressing = false
    let color = [Math.random(), Math.random(), Math.random()]
    t = Date.now() / 1000
    let ball_list = []
    model.animate(() => {
        let new_time = Date.now() / 1000
        dt = new_time - t;
        t = new_time;
           if (buttonState.left[0].pressed) {
            for (const ball of ball_list) {
                ball.remove(0)
            }
            model._children = []
            ball_list = [];
            pressing = false;
        } else if (!pressing && buttonState.left[1].pressed) {
            pressing = true
            ball_list.pop();
            model._children.pop()
        } else if (!pressing && buttonState.right[1].pressed) {
            pressing = true
            color = [Math.random(), Math.random(), Math.random()]
        } else if (!pressing && buttonState.right[0].pressed) {
            pressing = true
            let ball = model.add('sphere').color(color)
            ball.scale = .15
            ball.loc = [(Math.random() - .5) * 3, 1.5, (Math.random() - .5) * 3]
            ball.v = [0, 0, 0]
            ball_list.push(ball)
        } else if (left_not_pressing() && right_not_pressing()) {
            pressing = false;
        }
        for (const ball of ball_list) {
            physics(ball);
        }
    });
}

