import { detectBodies, bodyParts2D, bodyParts3D } from "../../lib/bodydetection.mjs"
import { drawImageWithOverlay, drawSolidCircle } from "../../lib/drawing.mjs"
import { continuosly } from "../../lib/system.mjs"
import { createCameraFeed } from "../../lib/video.mjs"

function outputDistance(output, body) {
    if (body) {
        const distance = body.getDistanceBetweenBodyParts3D(bodyParts3D.leftWrist, bodyParts3D.rightWrist)
        output.innerText = `Distance between wrists: ${distance.toFixed(2)}`
    }
}

function drawWrists(canvas, body) {
    if (body) {
        // draw circle for left and right wrist
        const leftWrist = body.getBodyPart2D(bodyParts2D.leftWrist)
        const rightWrist = body.getBodyPart2D(bodyParts2D.rightWrist)

        // draw left wrist
        drawSolidCircle(canvas, leftWrist.position.x, leftWrist.position.y, 10, 'white')

        // draw right wrist
        drawSolidCircle(canvas, rightWrist.position.x, rightWrist.position.y, 10, 'white')
    }
}

async function run(canvas, output) {
    let latestBody

    // create a video element connected to the camera 
    const video = await createCameraFeed(canvas.width, canvas.height, 'environment')

    const config = {
        video: video,
        maxPoses: 1,
        sampleRate: 100
    }
    // start listening to bodies in camera-feed
    detectBodies(config, (e) => latestBody = e.detail.bodies[0])

    // draw video with wrists overlaid onto canvas continuously
    continuosly(() => {
        drawImageWithOverlay(canvas, video, () => drawWrists(canvas, latestBody))
        outputDistance(output, latestBody)
    }

    )
}

export { run }