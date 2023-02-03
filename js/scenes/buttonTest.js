import {controllerMatrix, buttonState, joyStickState, time} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
let rebounce = .8
let physics = (ball) => {
    let vp = cg.add(ball.v, cg.scale(g, dt))
    ball.move(cg.scale(cg.mix(ball.v, vp, .5), dt))
    ball.v = vp
    let loc = ball.getGlobalMatrix().slice(12, 15)
    if (loc[1] < 1.) {
        ball.v = cg.scale(ball.v, -1 * rebounce)
        ball.move(0, 1 - loc[1], 0)
    }
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
    model.move(0, 1.5, 0).animate(() => {
        let new_time = Date.now() / 1000
        dt = new_time - t;
        t = new_time;
        if (buttonState.left[0].pressed) {
            for (const ball of ball_list) {
                ball.remove(0)
            }
            ball_list = [];
            pressing = false;
        } else if (!pressing && buttonState.left[1].pressed) {
            pressing = true
            let ball = ball_list.pop();
            ball.remove(0)
        } else if (!pressing && buttonState.right[1].pressed) {
            pressing = true
            color = [Math.random(), Math.random(), Math.random()]
        } else if (!pressing && buttonState.right[0].pressed) {
            pressing = true
            let ball = model.add()
            ball.add('sphere').scale(.15).move(Math.random() * 6, 0, Math.random() * 6).color(color);
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

