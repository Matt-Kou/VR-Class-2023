import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";
import {scale} from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
let rebounce_ground = .8
let ball;
let paddle;
let rubber;
const rubber_depth = 1.59 / 2;
const paddle_scale = .01
const ball_r = .02

const k = ball_r / rubber_depth / paddle_scale

let free_fall = (loc, v0, a, t) => [cg.add(cg.add(loc, cg.scale(v0, t)), cg.scale(a, .5 * t * t)), cg.add(v0, cg.scale(a, t))]

let bounce = (p0, v0, a, t, step) => {
    console.log("bounce", p0, v0, a, t, step)
    if (step === 5 || (p0[1] < 1e-8 && v0[1] < 1e-8)) {
        let [p, v] = free_fall(p0, v0, a, t)
        p[1] = 0
        v[1] = 0
        return [p, v]
    }
    console.assert(v0[1] > 0)
    let delta_t = -v0[1] * 2 / a[1]

    if (delta_t > t) {
        let [p, v] = free_fall(p0, v0, a, t)
        console.assert(p[1] > 0)
        return [p, v]
    }
    let [p, v] = free_fall(p0, v0, a, delta_t)
    console.log("p0, v0, a, delta_t", p0, v0, a, delta_t, p, v)
    console.assert(p[1] < 1e-8 && p[1] > -1e-8)
    v[1] = rebounce_ground * v[1]
    return bounce(p, v, a, t - delta_t, step + 1)
}
let physics_ball = (ball) => {
    let loc_rela = cg.subtract(cg.subtract(ball.loc, rubber.getGlobalMatrix().slice(12, 15)), [ball_r, ball_r, ball_r])
    console.log("loc_rela", loc_rela)
    let [p, v] = free_fall(loc_rela, ball.v, g, dt)
    if (p[1] < -1e-8) {
        let t1 = (-ball.v[1] - Math.sqrt(ball.v[1] * ball.v[1] - 2 * g[1] * loc_rela[1])) / g[1]
        console.assert(t1 <= dt)
        let pv = free_fall(loc_rela, ball.v, g, t1)
        console.log("pv", pv)
        console.assert(pv[0][1] < 1e-8)
        pv[1][1] = rebounce_ground * pv[1][1]
        console.assert(pv[1][1] > 0)
        pv = bounce(pv[0], pv[1], g, dt - t1, 0)
        p = pv[0]
        v = pv[1]
    }
    ball.loc = cg.add(cg.add(p, rubber.getGlobalMatrix().slice(12, 15)), [ball_r, ball_r, ball_r])
    ball.v = v
}

export const init = async model => {
    t = model.time
    paddle = model.add()
    const bend = Math.PI / 2
    rubber = paddle.add("tubeZ").move(0, 17 / 2, 0).scale(15 / 2, 17 / 2, rubber_depth).color(1, 0, 0);
    paddle.add("tubeZ").move(0, -9.8 / 2 + .2, 0).turnX(Math.PI / 2).scale(2.9 / 2, 2.24 / 2, 9.8 / 2).color(150 / 256, 111 / 256, 51 / 256)
    paddle.mat = paddle.getGlobalMatrix()
    ball = model.add("sphere").scale(ball_r)
    ball.loc = [0, 0, 0]
    ball.v = [0, 0, 0]
    let ball_holding = false
    model.animate(() => {
        let new_time = model.time
        dt = new_time - t;
        t = new_time;

        paddle.setMatrix(controllerMatrix.right).turnX(-bend)
        paddle.scale(paddle_scale)
        if (buttonState.left[0].pressed) {
            ball_holding = true
            ball.loc = cg.add(controllerMatrix.left.slice(12, 15), cg.scale(controllerMatrix.left.slice(8, 11), -.1))
        } else if (ball_holding) {
            let new_loc = cg.add(controllerMatrix.left.slice(12, 15), cg.scale(controllerMatrix.left.slice(8, 11), -.1))
            ball.v = cg.scale(cg.add(new_loc, cg.scale(ball.loc, -1)), 1 / dt)
            ball.loc = new_loc
            physics_ball(ball)
            ball_holding = false
        } else {
            physics_ball(ball)
        }
        ball.setMatrix(cg.mMultiply(cg.mTranslate(ball.loc), cg.mScale(ball_r)))
        paddle.mat = paddle.getGlobalMatrix()
    });
}

