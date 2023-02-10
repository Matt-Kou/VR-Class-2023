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

let physics_ball = (ball) => {
    let vp = cg.add(cg.scale(g, dt), ball.v)
    let old_loc = [ball.loc[0], ball.loc[1], ball.loc[2]]

    ball.loc = cg.add(ball.loc, cg.scale(cg.mix(ball.v, vp, .5), dt))
    ball.v = vp

    if (ball.loc[1] < ball_r) {
        // check ground hitting
        ball.loc[1] = ball_r
        ball.v[1] = -ball.v[1] * rebounce_ground
    } else {
        // console.log("loc, diff", ball.loc[1], old_loc[1])
        console.log("return:", paddle_ball_contact(ball.loc, old_loc))
        let [paddle_contact, d, d_old] = paddle_ball_contact(ball.loc, old_loc)
        console.log(paddle_contact, d, d_old)
        console.log("0")

        if (paddle_contact) {
            console.log("0.1")

            console.log("contact d", paddle_contact, d)
            // let pos_on_paddle = [d[0], d[1], d[2], 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
            // let paddle_v = cg.add(cg.mMultiply(pos_on_paddle, paddle.mat).slice(0, 4), cg.scale(cg.mMultiply(paddle.getGlobalMatrix(), paddle.mat).slice(0, 4), -1))
            // let relative_ball_v = cg.add(ball.v, scale(paddle_v, -1))
            ball.v = ball_rebounce(ball.v, rubber, paddle_contact)
            let rubber_mat = rubber.getGlobalMatrix()
            let ball_mat = cg.mTranslate(ball.loc)
            console.log("0.2")
            ball_mat = cg.mMultiply(cg.mInverse(rubber_mat), ball_mat)  // translate into rubber coordinate
            let z = (ball_mat[14]) * paddle_contact - (1 + k)
            if (z < 0) {
                z = -z
            }
            z += 1 + k
            ball_mat[14] = z * paddle_contact
            ball_mat = cg.mMultiply(rubber_mat, ball_mat)
            ball.loc = ball_mat.slice(12, 15)
            console.log("1")
            let [paddle_contact_, d_, d_old_] = paddle_ball_contact(ball.loc, old_loc)
            if (!((Math.abs(d_[1]) - 1 - k) * (Math.abs(d_old_[1]) - 1 - k) > 0)) {
                console.log("?????????????????????????????????????????????????????????????????????????????????????????????????????????????")
                console.log((Math.abs(d_[1]) - 1 - k), (Math.abs(d_old_[1]) - 1 - k))
            }
            if (paddle_contact_ !== 0) {
                console.log("??????????????????????????????????????????????????????!!!!!!!!!!!!!!!!!!!!!!!!!!")
                console.log(paddle_contact_)
            }
            console.assert((Math.abs(d_[1]) - 1 - k) * (Math.abs(d_old_[1]) - 1 - k) > 0)
            console.assert(paddle_contact_ === 0)
            console.log("2")
        }
    }
}

let ball_rebounce = (v, plane, direction, rebounce) => {
    if (rebounce === undefined) {
        rebounce = rebounce_ground
    }
    // if (plane_movement === undefined) {
    //     console.log()
    // }
    let normal = cg.scale(cg.normalize(plane.getGlobalMatrix().slice(8, 11)), direction)
    console.log("normal", normal)

    let proj = cg.scale(normal, -1 * cg.dot(v, normal))
    console.log("proj", proj)
    return cg.add(v, cg.scale(proj, 1 + rebounce))
}

let project_plane = (ball, plane) => {
    return cg.mMultiply(cg.mInverse(plane), ball).slice(12, 15)
}

let paddle_ball_contact = (ball_pos, ball_pos_old) => {
    let d = project_plane(cg.mTranslate(ball_pos), rubber.getGlobalMatrix())
    let d_old = project_plane(cg.mTranslate(ball_pos_old), rubber.getGlobalMatrix())
    // forehand: -1, backhand: 1, no contact: 0
    console.log("d:", d[2], d_old[2])
    if (d[0] * d[0] + d[1] * d[1] < 1 && (Math.abs(d[2]) < k + 1 || d[2] * d_old[2] < 0)) {
        console.log("contact!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        let z = d_old[2]
        if (z > 0 && z < 1 + k) {
            // backhand
            return [1, d, d_old]
        } else if (z < 0 && z > -1 - k) {
            // forehand
            return [-1, d, d_old]
        }
    }
    return [0, d, d_old]
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

