import * as global from "../global.js";
import {Gltf2Node} from "../render/nodes/gltf2.js";

export default () => {
    global.scene().addNode(new Gltf2Node({
        url: ""
    })).name = "backGround";

    return {
        enableSceneReloading: true,
        scenes: [
            {name: "DemoExample", path: "./demoExample.js"},
            {name: "robot", path: "./robot.js"},
            {name: "BallBounce", path: "./ball_bounce.js"},
            {name: "BallBounce2", path: "./ballBounce2.js"},
            {name: "BallBounce3", path: "./ballBounce3.js"},
            {name: "buttonTest", path: "./buttonTest.js"},
            // {name: "buttonTest2", path: "./buttonTest2.js"},
            {name: "buttonAndCollision", path: "./buttonTest3.js"},
            {name: "ctrlTest", path: "./ctrlTest.js"},
            {name: "ctrlTest2", path: "./ct2.js"},
            {name: "ctrlTest3", path: "./ctrlTest3.js"},
            {name: "hit", path: "./hit.js"},
            {name: "grab", path: "./grab.js"},
        ]
    };
}
