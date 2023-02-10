import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
let rebounce_ground = -0.8
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
    if (step === 5 || (p0[2] < 1e-8 && v0[2] < 1e-8)) {
        let [p, v] = free_fall(p0, v0, a, t)
        p[2] = 0
        v[2] = 0
        return [p, v]
    }
    console.assert(v0[2] > 0)
    let delta_t = -v0[2] * 2 / a[2]

    if (delta_t > t) {
        let [p, v] = free_fall(p0, v0, a, t)
        console.assert(p[2] > 0)
        return [p, v]
    }
    let [p, v] = free_fall(p0, v0, a, delta_t)
    console.assert(p[2] < 1e-8 && p[2] > -1e-8)
    v[2] = rebounce_ground * v[2]
    return bounce(p, v, a, t - delta_t, step + 1)
}

let mult_v_mat = (v, mat) => cg.add(cg.add(cg.scale(mat.slice(0, 3), v[0]), cg.scale(mat.slice(4, 7), v[1])), cg.scale(mat.slice(8, 11), v[2]))
let contact_rubber = (ball, rubber, a) => {
    let mat = rubber.getGlobalMatrix()
    console.log("z:", mat.slice(8, 11), "diff:", cg.subtract(ball.loc, mat.slice(12, 15)))
    if (cg.dot(mat.slice(8, 11), cg.subtract(ball.loc, mat.slice(12, 15))) < 0) {
        console.log("reversed!")
        mat = cg.mMultiply(mat, cg.mScale(-1))
        console.log("reversing", mat)
    }
    mat = cg.mMultiply(mat, cg.mTranslate(0, 0, k + 1))
    let change_coords = cg.mInverse(mat)
    let a_rela = mult_v_mat(a, change_coords)
    let v_rela = mult_v_mat(ball.v, change_coords)
    let ball_rela = cg.mMultiply(change_coords, ball.getGlobalMatrix())
    let loc = ball_rela.slice(12, 15)
    if (loc[2] < 0) loc[2] = 0
    console.log("relative loc:", loc, "relative g", a_rela, "relative spd", v_rela, "ball.v", ball.v)
    let pv;
    if (Math.abs(loc[2]) < 1e-8 && Math.abs(v_rela[2]) < 1e-8) {
        loc[2] = 0
        v_rela[2] = 0
        pv = [loc, v_rela]
    } else {
        pv = free_fall(loc, v_rela, a_rela, dt)
        if (pv[0][2] < -1e-8 && (pv[0][0] * pv[0][0] + pv[0][1] * pv[0][1] < 1)) {
            let t1 = (-v_rela[2] - Math.sqrt(v_rela[2] * v_rela[2] - 2 * a_rela[2] * loc[2])) / a_rela[2]
            console.log("v_rela", v_rela, "loc", loc)
            console.log("v_rela[2] * v_rela[2] - 2 * a_rela[2] * loc[2])", v_rela[2] * v_rela[2] - 2 * a_rela[2] * loc[2])
            console.log(t1, dt)
            console.assert(t1 <= dt)
            pv = free_fall(loc, v_rela, a_rela, t1)
            console.log("pv", pv)
            console.assert(pv[0][2] < 1e-8 && pv[0][2] > -1e-8)
            pv[1][2] = rebounce_ground * pv[1][2]
            console.assert(pv[1][2] > 0)
            pv = bounce(pv[0], pv[1], a_rela, dt - t1, 0)
            console.log("pv from bounce", pv)
        }
    }
    change_coords = mat
    loc = pv[0]
    // loc = cg.mMultiply(cg.mTranslate(0, 0, 1), cg.mTranslate(loc))
    loc = cg.mTranslate(loc)
    loc = cg.mMultiply(change_coords, loc).slice(12, 15)
    return [loc, mult_v_mat(pv[1], change_coords)]
}
let physics_ball = (ball) => {
    console.log("ball.loc", ball.loc)
    let pv = contact_rubber(ball, rubber, g)
    ball.loc = pv[0]
    ball.v = pv[1]
}


export const init = async model => {
    t = model.time
    paddle = model.add()
    const bend = Math.PI / 2
    rubber = paddle.add("tubeZ").move(0, 17 / 2, 0).scale(15 / 2, 17 / 2, rubber_depth).color(1, 0, 0);
    paddle.add("tubeZ").move(0, -9.8 / 2 + .2, 0).turnX(Math.PI / 2).scale(2.9 / 2, 2.24 / 2, 9.8 / 2).color(150 / 256, 111 / 256, 51 / 256)
    paddle.scale(paddle_scale)
    paddle.mat = paddle.getGlobalMatrix()
    ball = model.add("sphere").scale(ball_r)
    ball.loc = [0, 0, 0]
    ball.v = [0, 0, 0]
    ball.setMatrix(cg.mMultiply(cg.mTranslate(ball.loc), cg.mScale(ball_r)))
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

