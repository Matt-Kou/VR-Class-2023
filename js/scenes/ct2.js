import {controllerMatrix, buttonState, joyStickState, updateController} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

export const init = async model => {
    let bend = Math.PI / 4;
    let beam = model.add();
    beam.add('tubeZ').color(0, 0, 10)
    let sphere = model.add()
    sphere.add("sphere").scale(.1)
    let hand = "right";
    let offset = [-.0025, .005, -.03];
    let fallback = [.2, 0, 0];
    model.animate(() => {
        let m = controllerMatrix.right
        let t = model.time
        m = cg.mMultiply(m, cg.mRotateX(-bend))
        m = cg.mMultiply(m, cg.mScale(.002, .002, 1+Math.sin(t)))
        m = cg.mMultiply(m, cg.mTranslate(.0, .0, -1))
        m = cg.mMultiply(m, cg.mTranslate(offset))
        // sphere.identity().move(m.slice(12, 15)).move(m.slice(8, 11))
        // console.log("sp")
        // console.log(sphere.getGlobalMatrix())
        beam.setMatrix(m)
    });
}

