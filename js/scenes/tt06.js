import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
// let g = [0, -.1, 0]
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
    if (step === 5 || (p0[2] < 1e-8 && v0[2] < 1e-8)) {
        let [p, v] = free_fall(p0, v0, a, t)
        p[2] = 0
        v[2] = 0
        return [p, v]
    }
    let delta_t = -v0[2] * 2 / a[2]

    if (delta_t > t) {
        let [p, v] = free_fall(p0, v0, a, t)
        return [p, v]
    }
    let [p, v] = free_fall(p0, v0, a, delta_t)
    v[2] = rebounce_ground * v[2]
    return bounce(p, v, a, t - delta_t, step + 1)
}

let mult_v_mat = (v, mat) => add([cg.scale(mat.slice(0, 3), v[0]), cg.scale(mat.slice(4, 7), v[1]), cg.scale(mat.slice(8, 11), v[2]), cg.scale(mat.slice(12, 15), v[3])])
let mult_v3_mat = (v, mat) => add([cg.scale(mat.slice(0, 3), v[0]), cg.scale(mat.slice(4, 7), v[1]), cg.scale(mat.slice(8, 11), v[2])])

let get_rubber_mat = (rubber_mat) => {
    let rubber_to_world = rubber_mat
    if (cg.dot(rubber_to_world.slice(8, 11), cg.subtract(ball.loc, rubber_to_world.slice(12, 15))) < 0) {
        rubber_to_world = cg.mMultiply(rubber_to_world, cg.mScale(-1))
        ball.color(0, 0, 0)
    } else {
        ball.color(1, 1, 1)
    }
    rubber_to_world = cg.mMultiply(rubber_to_world, cg.mTranslate(0, 0, k + 1))
    return [rubber_to_world, cg.mInverse(rubber_to_world)]

}
let contact_rubber = (pv, world_to_rubber) => {
    let fall_point = cg.mMultiply(world_to_rubber, cg.mTranslate(pv[0])).slice(12, 15)
    // console.log("fall point", fall_point)
    if (fall_point[2] >= 0 || fall_point[0] * fall_point[0] + fall_point[1] * fall_point[1] >= 1) {
        rubber.color(1, 0, 0)
        return false
    }
    rubber.color(0, 1, 0)
    return fall_point
}

let add = (l) => {
    return l.reduce((x, y) => cg.add(x, y))
}
let bounce_rubber = (p0, v0, a, rubber_to_world, world_to_rubber) => {
    p0 = cg.mMultiply(world_to_rubber, cg.mTranslate(p0)).slice(12, 15)
    v0 = mult_v3_mat(v0, world_to_rubber)
    a = mult_v3_mat(a, world_to_rubber)
    if (p0[2] < 0) p0[2] = 0
    console.log("v0", v0, "p0", p0)
    let t = (-v0[2] - Math.sqrt(v0[2] * v0[2] - 2 * a[2] * p0[2])) / a[2]
    console.assert(t <= dt)
    if (t >= dt) {
        return [p0, v0]
    }
    let [p, v] = free_fall(p0, v0, a, t)
    console.log("pv", p, v)
    v[2] = rebounce_ground * v[2]
    let pv = bounce(p, v, a, dt - t)
    p = pv[0]
    v = pv[1]
    p = cg.mMultiply(rubber_to_world, cg.mTranslate(p)).slice(12, 15)
    return [p, mult_v3_mat(v, rubber_to_world)]
}

let physics_ball = (ball) => {
    let pv = free_fall(ball.loc, ball.v, g, dt)
    if (pv[0][2] <= 0) pv[0][2] = 0
    let [rubber_to_world, world_to_rubber] = get_rubber_mat(rubber.getGlobalMatrix())
    let contact_point = contact_rubber(pv, world_to_rubber)
    if (contact_point) {
        let [prev_rubber_to_world, prev_word_to_rubber] = get_rubber_mat(rubber.mat)
        let rubber_move = cg.subtract(rubber_to_world, prev_rubber_to_world)
        // let rubber_move_world = cg.mMultiply(rubber_to_world, rubber_move)
        let rubber_v = cg.scale(mult_v_mat([contact_point[0], contact_point[1], 1, 1], rubber_move), 1 / dt)
        // console.log("rubber_move_world", rubber_move_world, "rub move", rubber_move, "rubber_v", rubber_v, "contact_point", contact_point)
        console.log("rub move", rubber_move, "rubber_v", rubber_v, "contact_point", contact_point)
        let total_v = cg.subtract(ball.v, rubber_v)
        console.log("vs:", ball.v, rubber_v, total_v)
        console.log("total v", total_v)
        pv = bounce_rubber(ball.loc, total_v, g, rubber_to_world, world_to_rubber)
    }
    ball.loc = pv[0]
    ball.v = pv[1]
}


export const init = async model => {
    console.log("k:", k)
    t = model.time
    paddle = model.add()
    rubber = paddle.add("tubeZ").move(0, 17 / 2, 0).scale(15 / 2, 17 / 2, rubber_depth).color(1, 0, 0);
    paddle.add("tubeZ").move(0, -9.8 / 2 + .2, 0).turnX(Math.PI / 2).scale(2.9 / 2, 2.24 / 2, 9.8 / 2).color(150 / 256, 111 / 256, 51 / 256)
    paddle.move(0, 1, .1).turnX(-Math.PI / 2)
    // paddle.move(0, 1, -.01).turnX(3.14 / 2)
    paddle.scale(paddle_scale)
    rubber.mat = rubber.getGlobalMatrix()
    ball = model.add("sphere").scale(ball_r)
    // ball.loc = [0, 1.2, -.05]
    ball.loc = [0, 1.2, .05]
    ball.v = [0, 0, 0]
    ball.setMatrix(cg.mMultiply(cg.mTranslate(ball.loc), cg.mScale(ball_r)))
    model.animate(() => {
        // console.log("ball loc", ball.loc)
        let new_time = model.time
        dt = new_time - t;
        t = new_time;

        // paddle.identity().move(0, 1+Math.sin(model.time/10)/10, .1).turnX(-Math.PI / 2).scale(paddle_scale)
        paddle.move(0, 0, .1)
        physics_ball(ball)
        ball.setMatrix(cg.mMultiply(cg.mTranslate(ball.loc), cg.mScale(ball_r)))
        rubber.mat = rubber.getGlobalMatrix()
    });
}
