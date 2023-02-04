import {controllerMatrix, buttonState, joyStickState, updateController} from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

export const init = async model => {
    let tubeZ = model.add('tubeZ').color(1,0,0);
    let tubeZ0 = model.add('tubeZ');
    let bend = Math.PI / 4;
    let beam = model.add();
    beam.add('tubeZ').color(0, 0, 10)

    let hand = "right";
    let offset = [-.005, .01, -.03];
    let fallback = [.2, 0, 0];
    model.animate(() => {
        // tubeZ.setMatrix(controllerMatrix.right);
        let m = controllerMatrix.right
        // m = cg.mMultiply(m, cg.mTranslate(offset))
        tubeZ.setMatrix(m)
        m = cg.mMultiply(m, cg.mRotateX(-bend))
        tubeZ0.setMatrix(m)
        m = cg.mMultiply(m, cg.mScale(.002, .002, 10))
        // m[12] = controllerMatrix.right[12]*10
        // m[13] = controllerMatrix.right[13]*10
        // m[14] = controllerMatrix.right[14]*10
        beam.setMatrix(m)
    });
}

