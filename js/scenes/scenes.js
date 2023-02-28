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
            // {name: "robot", path: "./robot.js"},
            // {name: "BallBounce", path: "./ball_bounce.js"},
            // {name: "BallBounce2", path: "./ballBounce2.js"},
            // {name: "BallBounce3", path: "./ballBounce3.js"},
            // {name: "buttonTest", path: "./buttonTest.js"},
            // // {name: "buttonTest2", path: "./buttonTest2.js"},
            // {name: "buttonAndCollision", path: "./buttonTest3.js"},
            // {name: "ctrlTest", path: "./ctrlTest.js"},
            // {name: "ctrlTest2", path: "./ct2.js"},
            // {name: "ctrlTest3", path: "./ctrlTest3.js"},
            // {name: "hit", path: "./hit.js"},
            // {name: "grab", path: "./grab.js"},
            // {name: "proj", path: "./projPlane.js"},
            // {name: "tt01", path: "./tt.js"},
            // {name: "tt02", path: "./tt02.js"},
            // {name: "tt03", path: "./tt03.js"},
            // {name: "tt04", path: "./tt04.js"},
            // {name: "tt05", path: "./tt05.js"},
            // {name: "tt06", path: "./tt06.js"},
            // {name: "tt07", path: "./tt07.js"},
            // {name: "tt08", path: "./tt08.js"},
            // { name: "DemoKP0"           , path: "./demoKP0.js"           },
            // { name: "DemoKP1"           , path: "./demoKP1.js"           },
            // { name: "DemoKP2"           , path: "./demoKP2.js"           },
            // { name: "DemoKP3"           , path: "./demoKP3.js"           },
            { name: "DemoCanvas"        , path: "./demoCanvas.js"        },
            // { name: "DemoTwoCubes"      , path: "./demoTwoCubes.js"      },
            // { name: "DemoTrianglesMesh" , path: "./demoTrianglesMesh.js" },
            // { name: "DemoOpacity"       , path: "./demoOpacity.js"       },
            { name: "DemoHUD"           , path: "./demoHUD.js"           },
            { name: "DemoHands"         , path: "./demoHands.js"         },
            { name: "DemoShader"        , path: "./demoShader.js"        },
            { name: "DemoTerrain"       , path: "./demoTerrain.js"       },
            {name: "tt08", path: "./tt08.js"},
        ]
    };
}
