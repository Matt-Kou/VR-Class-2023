import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export const init = async model =>  {
    let robot = model.add()
    robot.texture('../media/robot.png')
    let head = robot.add('tubeY').scale([1.,1.3,.5]).color([192/255,192/255,192/255]).move([0.,2.,0.]).texture('../media/textures/robot2.png')
    let l_eye = head.add('sphere').color(1.5,1.5,1.5).scale([.3,.4,.4]).move([-1.2,.75,2.])
    let l_ppl = l_eye.add('sphere').color(.3,.3,.3).scale(.3).move([-.38,.1,3.3])
    let r_eye = head.add('sphere').color(1.5,1.5,1.5).scale([.3,.4,.4]).move([1.2,.75,2.])
    let r_ppl = r_eye.add('sphere').color(.3,.3,.3).scale(.3).move([.38,.1,3.3])
    let ppl_spd = 5
    let neck = robot.add('tubeY').scale(.2).color([192/255,192/255,192/255]).move([0.,6.,0.]).texture('../media/textures/robot.png')
    let body = robot.add('cube').scale([.9,1.2,.5]).color([192/255,192/255,192/255]).move([0.,-0.1,0.]).texture('../media/textures/robot.png')
    for (let i = 0; i < 10; i++) {
        body.add('donut').texture('../media/textures/fire.png')
    }
    let l_posterior_arm = robot.add('tubeX').scale([1.,.2, .2]).color([192/255,192/255,192/255]).move([-1.,2.5,0.]).texture('../media/textures/robot3.png')
    let l_joint = robot.add('sphere').scale(.3).color([192/255,192/255,192/255]).move([-7.,2.5/.3*.2,0.]).texture('../media/textures/robot3.png')
    let l_fore_arm = robot.add('tubeZ').texture('../media/textures/robot3.png')
    let l_fire = l_fore_arm.add('cube').texture('../media/textures/robot4.jpg').move([0.,0.,1.]).scale([2.,2.,.5])
    let l_power = robot.add().move([0.,0.,2.]).scale(.2,.2,.1)
    for (let i = 0; i < 20; i++) {
        l_power.add('donut').texture('../media/textures/fire.png')
        l_power.child(i).last_distance = 999
    }
    l_power.scale([1.3,1.3,.5])
    let r_posterior_arm = robot.add('tubeX').texture('../media/textures/robot3.png').scale([1.,.2, .2]).color([192/255,192/255,192/255]).move([1.,2.5,0.])
    let r_joint = robot.add('sphere').texture('../media/textures/robot3.png').scale(.3).color([192/255,192/255,192/255]).move([7.,2.5/.3*.2,0.])
    let r_fore_arm = robot.add('tubeZ').texture('../media/textures/robot3.png')
    let r_fist = r_fore_arm.add('cube').texture('../media/textures/robot4.jpg').move([0.,0.,1.5]).scale([1.,1.,.3]).turnX(3.14/4).turnY(3.14/4)
    model.move(0,1.5,0).scale(.1).animate(() => {
        let angel = Math.sin(2.*model.time)/3
        for (let i = 0; i < 20; i++) {
            let distance = 20.*model.time
            distance = (distance + i*8) % 80
            if (l_power.child(i).last_distance > distance) {
                l_power.child(i).angel = Math.sin(Math.random()*10)
            }
            l_power.child(i).last_distance = distance
            l_power.child(i).identity().move([-8.,l_power.child(i).angel*distance/5+-Math.sin(angel)*8.+2,distance*10])
        }
        for (let i = 0; i < 10; i++) {
            let distance = 5.*model.time
            distance = (distance + i*5) % 10
            body.child(i).identity().turnX(3.14/2).scale([1.3,1.3/.9*1.2,.5]).move([0,0,distance+3]).turnZ(model.time*10)
        }
        r_fist.turnY(2*model.time%10)
        l_ppl.move([Math.sin(ppl_spd*model.time)/50,Math.cos(ppl_spd*model.time)/50,(-Math.cos(ppl_spd*model.time))/70])
        r_ppl.move([Math.sin(ppl_spd*model.time)/50,Math.cos(ppl_spd*model.time)/50,(-Math.cos(ppl_spd*model.time))/70])
        l_fore_arm.identity().turnX(angel).scale([.2,.2,.8]).move([-7./.2*.3-.3,Math.sin(angel)+2.5/.3*.2/.2*.3,1.2*Math.cos(angel)]);
        r_fore_arm.identity().turnY(angel).scale([.2,.2,.8]).move([7./.2*.3+.3,1.2*Math.cos(angel)+1.5,Math.sin(angel)+2.5/.3*.2/.2*.3-1.]);
        robot.identity().move([0, Math.sin(model.time*2)/5, 0]).turnY(Math.sin(model.time/3)/9);
        // robot.identity().turnY(3.14/2);
    });
}