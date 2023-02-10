import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
// let g = [0, -99.1, 0]
let rebounce_ground = 0.8
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
    let old_v = ball.v
    ball.loc = cg.add(ball.loc, cg.scale(cg.mix(ball.v, vp, .5), dt))
    ball.v = vp

    if (ball.loc[1] < ball_r) {
        // check ground hitting
        ball.loc[1] = ball_r
        ball.v[1] = -ball.v[1] * rebounce_ground
    } else {
        let [paddle_contact, d, d_old] = paddle_ball_contact(ball.loc, old_loc)
        if (paddle_contact) {
            ball.v = ball_rebounce(old_v, rubber, paddle_contact)
            if (paddle_contact * d_old[2] < 0) {
                console.log("paddle_contact,d_old[2]", paddle_contact, d_old[2])
                console.assert(paddle_contact * d_old[2] > 0)
            }
            let z = d[2] * paddle_contact - k - 1
            console.assert(d_old[2] * paddle_contact > 0)
            if (z > 0) {
                console.log("z>0")
                console.assert(z < 0)
            }
            z = (-z + k + 1 + .001) * paddle_contact
            // z = (k + 1 + .001) * paddle_contact
            let rubber_mat = rubber.getGlobalMatrix()
            ball.loc = rubber_mat.slice(12, 15)
            ball.loc = cg.add(cg.scale(rubber_mat.slice(0, 3), d[0]), ball.loc)
            ball.loc = cg.add(cg.scale(rubber_mat.slice(4, 7), d[1]), ball.loc)
            ball.loc = cg.add(cg.scale(rubber_mat.slice(8, 11), z), ball.loc)
            console.log("values:", d[2], z, k + 1)
            console.log("testing:")
            let [paddle_contact_, d_, d_old_] = paddle_ball_contact(ball.loc, old_loc)
            console.log("should be very close:", d_[2], z)
            if (d_[2] * d_old_[2] < 0) {
                console.log("?????????????????????????????????????????????????????????????????????????????????????????????????????????????")
                console.log((Math.abs(d_[2]) - 1 - k), (Math.abs(d_old_[2]) - 1 - k), Math.abs(d_[2]), k + 1)
                console.log(paddle_contact_)
            }
            if (paddle_contact_ !== 0) {
                console.log("??????????????????????????????????????????????????????!!!!!!!!!!!!!!!!!!!!!!!!!!")
                console.log((Math.abs(d_[2]) - 1 - k), (Math.abs(d_old_[2]) - 1 - k), Math.abs(d_[2]), k + 1)
                console.log(paddle_contact_)
            }
            console.assert((Math.abs(d_[1]) - 1 - k) * (Math.abs(d_old_[1]) - 1 - k) > 0)
            console.assert(paddle_contact_ === 0)
            // g = [0, 0, 0]
            // ball.v = [0, 0, 0]
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
    // let energy = cg.dot(proj, proj) * rebounce
    // let spd = Math.sqrt(energy)
    console.log("backspd", cg.add(v, cg.scale(proj, 1 + rebounce)))
    return cg.add(v, cg.scale(proj, 1 + rebounce))
}

let project_plane = (ball, plane) => {
    return cg.mMultiply(cg.mInverse(plane), ball).slice(12, 15)
}

let ball_energy = () => -cg.dot(ball.loc, g) + .5 * cg.dot(ball.v, ball.v)


let paddle_ball_contact = (ball_pos, ball_pos_old) => {
    let d = project_plane(cg.mTranslate(ball_pos), rubber.getGlobalMatrix())
    let d_old = project_plane(cg.mTranslate(ball_pos_old), rubber.getGlobalMatrix())
    // forehand: -1, backhand: 1, no contact: 0
    console.log("d[2], d_old[2]", d[2], d_old[2])
    if (d[0] * d[0] + d[1] * d[1] < 1 && (Math.abs(d[2]) < k + 1 || d[2] * d_old[2] < 0)) {
        console.log("contact!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        let z = d_old[2]
        if (z > 0) {
            // backhand
            return [1, d, d_old]
        } else if (z < 0) {
            // forehand
            return [-1, d, d_old]
        } else {
            console.log("impossible!!!!!!!!!!!!!!!!!!!!!!!!!!WDERGFEWDFGFBRTGFRVDBGTRGERFWVDER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        }
    }
    return [0, d, d_old]
}

export const init = async model => {
    console.log("k:", k)
    t = model.time
    paddle = model.add()
    rubber = paddle.add("tubeZ").move(0, 17 / 2, 0).scale(15 / 2, 17 / 2, rubber_depth).color(1, 0, 0);
    paddle.add("tubeZ").move(0, -9.8 / 2 + .2, 0).turnX(Math.PI / 2).scale(2.9 / 2, 2.24 / 2, 9.8 / 2).color(150 / 256, 111 / 256, 51 / 256)
    paddle.move(0, 1, -.01).turnX(Math.PI/2).turnY(Math.PI)
    // paddle.move(0, 1, -.01).turnX(3.14 / 2)
    paddle.scale(paddle_scale)
    paddle.mat = paddle.getGlobalMatrix()
    ball = model.add("sphere").scale(ball_r)
    ball.loc = [0, 1.1, .1]
    ball.v = [0, 0, 0]
    model.animate(() => {
        let new_time = model.time
        dt = new_time - t;
        t = new_time;
        physics_ball(ball)
        ball.setMatrix(cg.mMultiply(cg.mTranslate(ball.loc), cg.mScale(ball_r)))
        paddle.mat = paddle.getGlobalMatrix()
    });
}

