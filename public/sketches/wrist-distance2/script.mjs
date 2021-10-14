import { detectBodies, bodyPartsList } from "../../lib/bodydetection.mjs"
import { drawImageWithOverlay, drawSolidCircle } from "../../lib/drawing.mjs"
import { continuosly } from "../../lib/system.mjs"
import { createCameraFeed, facingMode } from "../../lib/camera.mjs"
import { clamp } from "../../lib/util.mjs"

let wristDistance = 0;


//calculates the distance between two bodyparts
function outputDistance(status, body) {
    if (body) {
        const distance = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightElbow)
        status.innerText = `Distance between wrists: ${distance.toFixed(2)} m`
        wristDistance = distance.toFixed(2)
    }
}

function changeColor(wristDistance) {
    let scaledWristDistance = clamp(wristDistance);
        document.body.style.backgroundColor = `rgb(${250 * scaledWristDistance} ,60, 85)`;
        console.log(scaledWristDistance);
    
}

function drawWrists(canvas, body) {
    if (body) {
        // draw circle for left and right wrist
        const nose = body.getBodyPart2D(bodyPartsList.nose)
        const rightElbow = body.getBodyPart2D(bodyPartsList.rightElbow)

        // draw left wrist
        drawSolidCircle(canvas, nose.position.x, nose.position.y, 10, 'white')

        // draw right wrist
        drawSolidCircle(canvas, rightElbow.position.x, rightElbow.position.y, 10, 'white')
    }
}

async function run(canvas, status) {
    let latestBody

    // create a video element connected to the camera
    const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

    const config = {
        video: video,
        multiPose: false,
        sampleRate: 100,
        flipHorizontal: true // true if webcam

    }
    // start detecting bodies camera-feed a set latestBody to first (and only) body
    detectBodies(config, function (e) 
    { 
        latestBody = e.detail.bodies.listOfBodies[0] 
    })

    // draw video with wrists overlaid onto canvas continuously
    continuosly(() => {
        drawImageWithOverlay(canvas, video, () => drawWrists(canvas, latestBody))
        outputDistance(status, latestBody)
        changeColor(wristDistance);
    })

}

export { run }

