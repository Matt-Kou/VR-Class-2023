import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
let rebounce = .8
let ball;
let paddle;
let rubber;
const rubber_depth = 1.59 / 2;
const paddle_scale = .01

let physics_ball = (obj) => {
    let vp = cg.add(cg.scale(g, dt), obj.v)
    obj.loc = cg.add(obj.loc, cg.scale(cg.mix(obj.v, vp, .5), dt))
    obj.v = vp
    obj.setMatrix(cg.mMultiply(cg.mTranslate(obj.loc), cg.mScale(obj.scale)))
}

let project_plane = (ball, plane) => {
    return cg.mMultiply(cg.mInverse(plane), ball).slice(12, 15)
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
    t = model.time
    paddle = model.add()
    const bend = Math.PI / 2
    rubber = paddle.add("tubeZ").move(0, 17 / 2, 0).scale(15 / 2, 17 / 2, rubber_depth).color(1, 0, 0);
    paddle.add("tubeZ").move(0, -9.8 / 2 + .2, 0).turnX(Math.PI / 2).scale(2.9 / 2, 2.24 / 2, 9.8 / 2).color(150 / 256, 111 / 256, 51 / 256)
    ball = model.add("sphere")
    ball.r = .015
    model.animate(() => {
        let new_time = model.time
        dt = new_time - t;
        t = new_time;
        // let m = cg.mMultiply(controllerMatrix.right, cg.mScale(1))
        // m[12] = m[4] / 10 + m[12]
        // m[13] = m[5] / 10 + m[13]
        // m[14] = m[6] / 10 + m[14]
        // m[12] = -m[8] / 10 + m[12]
        // m[13] = -m[9] / 10 + m[13]
        // m[14] = -m[10] / 10 + m[14]
        // ball.setMatrix(m)
        // ball.scale(ball.r)
        ball.identity().move(0, 1.5, .5).scale(ball.r)

        paddle.setMatrix(controllerMatrix.right).turnX(-bend)
        paddle.scale(paddle_scale)

        let d = project_plane(ball.getGlobalMatrix(), rubber.getGlobalMatrix())
        if (d[0] * d[0] + d[1] * d[1] < 1) {
            let z = d[2]
            let k = ball.r / rubber_depth / paddle_scale
            console.log("z", z, "r", ball.r, "k,", k)
            if (z > 0 && (z < 1 || z < 1 + k)) {
                // backhand
                rubber.color(0, 0, 0)
            } else if (z < 0 && z > -1 - k) {
                // forehand
                rubber.color(0, 1, 0)
            } else {
                rubber.color(1, 0, 0)
            }
        } else {
            rubber.color(1, 0, 0)

        }
        // model.turnY(dt * 2)
    });
}

