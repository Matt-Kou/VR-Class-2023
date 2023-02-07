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
    let ball = model.add().move(0, 1.5, 0)
    ball.r = .15;
    ball.add("sphere").scale(ball.r)
    let offset = [-.0025, .005, -.03];
    t = Date.now() / 1000
    let bend = Math.PI / 4;
    let beam = model.add();
    beam.add('tubeZ').color(0, 0, 10)

    let anchor = model.add()
    anchor.add("sphere").scale(.05).color(1, 1, 0)

    let pressing = false
    model.animate(() => {
        let new_time = Date.now() / 1000
        dt = new_time - t;
        t = new_time;

        let m = controllerMatrix.right
        m = cg.mMultiply(m, cg.mRotateX(-bend))
        m = cg.mMultiply(m, cg.mScale(.002, .002, 2))
        m = cg.mMultiply(m, cg.mTranslate(.0, .0, -1))
        m = cg.mMultiply(m, cg.mTranslate(offset))
        beam.setMatrix(m)

        let toBall = cg.add(ball.getGlobalMatrix().slice(12, 15), cg.scale(m.slice(12, 15), -1))
        let dir = cg.scale(cg.normalize(m.slice(8, 11)), -1)
        
        anchor.identity().move(m.slice(12, 15)).move(dir)
        // dir = cg.normalize(dir)
        let d = cg.norm(cg.cross(toBall, dir))
        let press = !right_not_pressing()
        if (press) {
            if (!pressing) {
                if (d <= ball.r) {
                    // hit!
                    ball.color(0, 1, 0)
                    ball.grab = cg.mMultiply(cg.mInverse(m), ball.getGlobalMatrix())
                } else {
                    ball.color(1, 1, 1)
                }
            } else {
                ball.color(0, 1, 0)
                ball.setMatrix(cg.mMultiply(m, ball.grab))
            }
            pressing = true;
        } else {
            if (d <= ball.r) {
                // hit!
                ball.color(1, 0, 0)
            } else {
                ball.color(1, 1, 1)
            }
            pressing = false;
        }

    });
}

