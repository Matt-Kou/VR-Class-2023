import {controllerMatrix, buttonState, joyStickState} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

let t = Date.now() / 1000;
let dt = 0;
let g = [0, -9.81, 0]
let rebounce = .8
let ball_list = []
let scale = .15

let physics = (obj) => {
    let vp = cg.add(cg.scale(g, dt), obj.v)
    obj.loc = cg.add(obj.loc, cg.scale(cg.mix(obj.v, vp, .5), dt))
    obj.v = vp
    for (const obj2 of ball_list) {
        if (obj2.index >= obj.index) {
            break;
        }
        const distance = obj.scale + obj2.scale - cg.distance(obj.loc, obj2.loc)
        if (distance > 0) {
            const norm = cg.normalize(cg.subtract(obj.loc, obj2.loc))
            const projection = cg.dot(obj.v, norm)
            const direction = cg.scale(norm, -2 * rebounce * projection)
            obj.v = cg.add(obj.v, direction)
            obj2.v = cg.add(obj2.v, cg.scale(norm, 2 * rebounce * projection))
            obj.loc = cg.add(obj.loc, cg.scale(norm, -distance))
            obj2.loc = cg.add(obj2.loc, cg.scale(norm, distance))
        }
    }
    if (obj.loc[1] < obj.scale) {
        obj.v[1] = -obj.v[1] * rebounce
        obj.loc[1] = obj.scale
        // obj.playAudio()
    }
    // obj.playAudio()
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
    let offset = [-.0025, .005, -.03];
    t = Date.now() / 1000
    let color = [Math.random(), Math.random(), Math.random()]

    let bend = Math.PI / 4;
    let beam = model.add();
    beam.add('tubeZ').color(0, 0, 10)

    let anchor_ball;
    let new_ball = () => {
        anchor_ball = model.add('sphere')
    }
    new_ball()
    let pressing = false
    let index = 0
    model.animate(() => {
        let new_time = Date.now() / 1000
        dt = new_time - t;
        t = new_time;

        let m = controllerMatrix.right
        m = cg.mMultiply(m, cg.mRotateX(-bend))
        m = cg.mMultiply(m, cg.mScale(.002, .002, 1 + Math.sin(t)))
        m = cg.mMultiply(m, cg.mTranslate(.0, .0, -1))
        m = cg.mMultiply(m, cg.mTranslate(offset))
        beam.setMatrix(m)

        anchor_ball.identity().move(m.slice(12, 15)).move(cg.scale(m.slice(8, 11), -1)).scale(scale).color(color)
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
            let new_loc = anchor_ball.getGlobalMatrix().slice(12, 15)
            anchor_ball.scale = scale
            anchor_ball.index = index
            index += 1
            anchor_ball.v = cg.scale(cg.add(new_loc, cg.scale(anchor_ball.loc, -1)), 1 / dt)
            console.log(anchor_ball.v)
            ball_list.push(anchor_ball)
            new_ball()
            // ball.audio("../media/sound/drums.ogg")
            // ball.playAudio()
        } else if (left_not_pressing() && right_not_pressing()) {
            pressing = false;
        }
        for (const ball of ball_list) {
            physics(ball);
        }
        anchor_ball.loc = anchor_ball.getGlobalMatrix().slice(12, 15)
    });
}

