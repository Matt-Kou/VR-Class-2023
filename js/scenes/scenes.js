import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: true,
      scenes: [
         { name: "DemoExample" , path: "./demoExample.js" },
         // { name: "robot" , path: "./robot.js" },
         { name: "BallBounce" , path: "./ball_bounce.js" },
      ]
   };
}
