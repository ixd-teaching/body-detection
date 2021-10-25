import { detectBodies, bodyPartsList } from "../../lib/bodydetection.mjs";
import {
    drawImageWithOverlay,
    drawSolidCircle,
    drawStar,
} from "../../lib/drawing.mjs";
import { continuosly } from "../../lib/system.mjs";
import { createCameraFeed, facingMode } from "../../lib/camera.mjs";
import { clamp, scale } from "../../lib/util.js";

let canvas;
let ctx;
let flowField;
let flowFieldAnimation;

//loads on window load. creates the canvas and gets the context also starts the animations
window.onload = function () {
    canvas = document.getElementById("canvas1");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
    flowField.animate(0);
};
// resizes the canvas at all times to match the window size
window.addEventListener("resize", function () {
    this.cancelAnimationFrame(flowFieldAnimation);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
    flowField.animate(0);
});

// x,y coordinates for the nose
const nose = {
    x: 0,
    y: 0,
    z: 0,
};

let earToShoulderDistance = 0;

//gets the position of your body part and converts it into x,y coordinates on the canvas
//works the same way as a mouse
function nosePosition(body) {
    const nosePos2d = body.getBodyPart2D(bodyPartsList.nose);
    const nosePos3d = body.getBodyPart3D(bodyPartsList.nose);

    nose.x = nosePos2d.position.x;
    nose.y = nosePos2d.position.y;
    nose.z = nosePos3d.position.z.toFixed(2);
    //console.log(nose.z);
}

function e2sDistance(body) {
    if (body) {
        const rDistance = body.getDistanceBetweenBodyParts3D(
            bodyPartsList.leftEar,
            bodyPartsList.leftShoulder
        );
        const lDistance = body.getDistanceBetweenBodyParts3D(
            bodyPartsList.rightEar,
            bodyPartsList.rightShoulder
        );
        if (rDistance <= lDistance) {
            earToShoulderDistance = rDistance;
        } else {
            earToShoulderDistance = lDistance;
        }
        console.log(earToShoulderDistance);
    }
}
//class were we run most of our code.
class FlowFieldEffect {
    //# means that the variables are private and can not be accessed outside of the class
    #ctx;
    #width;
    #height;
    //Create a constructor that hold most of the values of how we want to paint the canvas.
    constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#ctx.lineWidth = 1;
        this.#width = width;
        this.#height = height;
        this.lastTime = 0;
        this.interval = 1000 / 60;
        this.timer = 0;
        this.cellSize = 15;
        this.gradient;
        /*         this.#createGradient(); */
        this.#ctx.strokeStyle = "white"; //this.gradient;

        //controls the animation/curvage of the lines
        this.radius = 0;
        this.vr = earToShoulderDistance.toFixed(2) / 10;
    }

    //creates a gradient with multiple colors
    /*   #createGradient(){
        this.gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height);
        this.gradient.addColorStop("0.1", "#ff5c33");
        this.gradient.addColorStop("0.2", "#ff66b3");
        this.gradient.addColorStop("0.4", "#ccccff");
        this.gradient.addColorStop("0.6", "#b3ffff");
        this.gradient.addColorStop("0.8", "#80ff80");
        this.gradient.addColorStop("0.9", "#ffff33");
    } */

    //How we draw the lines. We also control the length of the lines depending on the distance to the nose
    #drawLine(angle, x, y) {
        let positionX = x;
        let positionY = y;
        let dx = nose.x - positionX;
        let dy = nose.y - positionY;
        let distance = dx * dx + dy * dy * nose.z * 10; //använd distance mellan öron för att påverka storlek på distancefunktionen
        if (distance > 600000) distance = 600000;
        else if (distance < 50000) distance = 50000;
        let length = distance * 0.0001;
        this.#ctx.beginPath();
        this.#ctx.moveTo(x, y);
        this.#ctx.lineTo(
            x + Math.cos(angle) * length,
            y + Math.sin(angle) * length
        );
        this.#ctx.stroke();
    }

    //runs all the time
    //draws everything and updates the canvas between every drawing
    //its also caped to only draw 60 times a second as to not use unessecary computation power
    //this can also be changed depending on how fast your computer is but generally there's no point in doing it
    animate(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        if (this.timer > this.interval) {
            this.#ctx.clearRect(0, 0, this.#width, this.#height);
            this.radius += this.vr;
            if (this.radius > 5 || this.radius < -5) this.vr *= -1;

            for (let y = 0; y < this.#height; y += this.cellSize) {
                for (let x = 0; x < this.#width; x += this.cellSize) {
                    const angle =
                        (Math.cos(x * 0.01) + Math.sin(y * 0.01)) * this.radius;
                    this.#drawLine(angle, x, y);
                }
            }

            this.timer = 0;
        } else {
            this.timer += deltaTime;
        }
        //loops the function. You have to bind .this otherwise it forgets what we are looking for
        flowFieldAnimation = requestAnimationFrame(this.animate.bind(this));
    }
}
// sets up the camera feed.
async function run(canvas, status) {
    let latestBody;

    // create a video element connected to the camera
    const video = await createCameraFeed(
        window.innerWidth,
        window.innerHeight,
        facingMode.environment
    );

    const config = {
        video: video,
        multiPose: false,
        sampleRate: 100,
        flipHorizontal: true, // true if webcam
    };

    // start detecting bodies camera-feed a set latestBody to first (and only) body
    detectBodies(config, (e) => (latestBody = e.detail.bodies.listOfBodies[0]));

    // draw video with nose and eyes overlaid onto canvas continuously and output speed of nose
    continuosly(() => {
        if (latestBody) nosePosition(latestBody);
        e2sDistance(latestBody);
    });
}
export { run };
