import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";
import {g2} from "../util/g2.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
// let g = [0, -.1, 0]
let rebounce_ground = -0.8
let ball;
let paddle;
let rubber;
let rubber_changer
const rubber_depth = 1.59 / 2;
const paddle_scale = .01
const ball_r = .02
let show_panel = true

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
    }
    rubber_to_world = cg.mMultiply(rubber_to_world, cg.mTranslate(0, 0, k + 1))
    return [rubber_to_world, cg.mInverse(rubber_to_world)]

}
let contact_rubber = (pv, world_to_rubber) => {
    let fall_point = cg.mMultiply(world_to_rubber, cg.mTranslate(pv[0])).slice(12, 15)
    if (fall_point[2] >= 0 || fall_point[0] * fall_point[0] + fall_point[1] * fall_point[1] >= 1) {
        rubber.color(rubber_changer.rgb)
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
    ball.color(1, 1, 1)
    if (p0[2] < 1e-4) {
        p0[2] = 0
        if (Math.abs(v0[2]) < 1e-4) {
            v0[2] = 0
            ball.color(0, 0, 0)
            return [cg.mMultiply(rubber_to_world, cg.mTranslate(p0)).slice(12, 15), mult_v3_mat(v0, rubber_to_world)]
        }
    }
    ball.color(1, 1, 1)
    let t = (-v0[2] - Math.sqrt(v0[2] * v0[2] - 2 * a[2] * p0[2])) / a[2]
    let pv
    if (t >= dt) {
        v0[2] = rebounce_ground * v0[2]
        pv = [p0, v0]
    } else {
        console.assert(t <= dt)
        pv = free_fall(p0, v0, a, t)
        pv[1][2] = rebounce_ground * pv[1][2]
        pv = bounce(pv[0], pv[1], a, dt - t)
    }
    let p = pv[0]
    let v = pv[1]
    p = cg.mMultiply(rubber_to_world, cg.mTranslate(p)).slice(12, 15)
    return [p, mult_v3_mat(v, rubber_to_world)]
}

let physics_ball = (ball) => {
    let pv = free_fall(ball.loc, ball.v, g, dt)
    let [rubber_to_world, world_to_rubber] = get_rubber_mat(rubber.getGlobalMatrix())
    let contact_point = contact_rubber(pv, world_to_rubber)
    if (contact_point) {
        let [prev_rubber_to_world, prev_word_to_rubber] = get_rubber_mat(rubber.mat)
        let rubber_move = cg.subtract(rubber_to_world, prev_rubber_to_world)
        let rubber_v = cg.scale(mult_v_mat([contact_point[0], contact_point[1], 1, 1], rubber_move), 1 / dt)
        let total_v = cg.subtract(ball.v, rubber_v)
        pv = bounce_rubber(ball.loc, total_v, g, rubber_to_world, world_to_rubber)
    }
    ball.loc = pv[0]
    ball.v = pv[1]
}

let clone_buttonState = () => {
    let clone = {left: [], right: []}
    for (const hand in buttonState) {
        const l = buttonState[hand]
        for (let i = 0; i < l.length; i++) {
            const button_clone = {"pressed": l[i].pressed, "touched": l[i].touched, value: l[i].value}
            clone[hand].push(button_clone)
        }
    }
    return clone
}

export const init = async model => {
    t = model.time
    paddle = model.add()
    const bend = Math.PI / 2
    rubber = paddle.add("tubeZ").move(0, 17 / 2, 0).scale(15 / 2, 17 / 2, rubber_depth).color(1, 0, 0);
    paddle.add("tubeZ").move(0, -9.8 / 2 + .2, 0).turnX(Math.PI / 2).scale(2.9 / 2, 2.24 / 2, 9.8 / 2).color(150 / 256, 111 / 256, 51 / 256)
    paddle.scale(paddle_scale)
    rubber.mat = rubber.getGlobalMatrix()
    ball = model.add("sphere").scale(ball_r)
    ball.loc = [0, 0, 0]
    ball.v = [0, 0, 0]
    ball.setMatrix(cg.mMultiply(cg.mTranslate(ball.loc), cg.mScale(ball_r)))
    let ball_holding = false
    let prev_buttonState = clone_buttonState();

    rubber_changer = model.add("cube").texture(() => {
        g2.setColor('white')
        g2.fillRect(0, 0, 1, 1)
        g2.setColor('black')
        g2.textHeight(.1)
        g2.fillText("rubber color changer", .5, .9, 'center')
        g2.drawWidgets(rubber_changer)

        let r = .5 + .5 * Math.cos(Math.PI * rubber_changer.rubber_color),
            g = .5 - .5 * Math.cos(2 * Math.PI * rubber_changer.rubber_color),
            b = .5 - .5 * Math.cos(Math.PI * rubber_changer.rubber_color);
        g2.textHeight(.1)
        g2.fillText(`opacity: ${Math.max(rubber_changer.opacity, 1e-3).toFixed(2)}`, .5, .4, 'center')
        g2.fillText(`rubber color: ${rubber_changer.rubber_color.toFixed(2)}`, .5, .5, 'center')
        g2.setColor('red')
        g2.fillText(`r: ${r.toFixed(2)}`, .15, .1, 'center')
        g2.setColor('green')
        g2.fillText(`g: ${g.toFixed(2)}`, .5, .1, 'center')
        g2.setColor('blue')
        g2.fillText(`b: ${b.toFixed(2)}`, .85, .1, 'center')
        g2.setColor('red')
        // g2.fillText(`${prev_buttonState.left[5].pressed}, ${buttonState.left[5].pressed}`, .5, .3, 'center')
        rubber_changer.rgb = [r, g, b]
        rubber.opacity(Math.max(rubber_changer.opacity, 1e-1))
    })
    rubber_changer.rubber_color = 0
    rubber_changer.opacity = 1
    let color_slider = g2.addWidget(rubber_changer, 'slider', .5, .7, '#80ffff', 'color', value => rubber_changer.rubber_color = value);
    color_slider.setValue(0)
    let opacity_slider = g2.addWidget(rubber_changer, 'slider', .5, .6, '#80ffff', 'opacity', value => rubber_changer.opacity = value);
    opacity_slider.setValue(1)
    model.animate(() => {
        let new_time = model.time
        dt = new_time - t;
        t = new_time;
        rubber_changer.hud().move(0, 0, 0).scale(.25, .25, .0001)
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
        rubber.mat = rubber.getGlobalMatrix()
        // console.log("prev")
        // console.log(prev_buttonState.left[5].touched, prev_buttonState.left[5].pressed)
        // console.log("now")
        // console.log(buttonState.left[5].touched, buttonState.left[5].pressed)
        if (prev_buttonState.left[5].pressed === false && buttonState.left[5].pressed === true) {
            // console.log("onpress!")
            if (show_panel) {
                model.remove(rubber_changer)
            } else {
                model._children.push(rubber_changer)
            }
            show_panel = !show_panel
        }
        prev_buttonState = clone_buttonState()

    });
}
