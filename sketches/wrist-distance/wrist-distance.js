// @ts-nocheck


/* ----- setup ------ */


let body

// get elements
let video = document.getElementById("video")
let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

// draw the video, nose and eyes into the canvas
function drawCameraIntoCanvas() {

    // draw the video element into the canvas
    ctx.drawImage(video, 0, 0, video.width, video.height);

    if (body) {
        // draw circle for left and right wrist
        const leftWrist = body.getBodyPart(bodyParts.leftWrist)
        const rightWrist = body.getBodyPart(bodyParts.rightWrist)

        // draw left wrist
        ctx.beginPath()
        ctx.arc(leftWrist.position.x, leftWrist.position.y, 10, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill()

        // draw right wrist
        ctx.beginPath()
        ctx.arc(rightWrist.position.x, rightWrist.position.y, 10, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill()
    }

    // 
    outputDistance ()

    requestAnimationFrame(drawCameraIntoCanvas)
}

function outputDistance() {
    if (body != null) {
        const distance = Math.round(body.getDistanceBetweenBodyParts(bodyParts.leftWrist, bodyParts.rightWrist));
        document.getElementById('output').innerText = `Distance between wrists: ${distance}`;
        body.getDistanceBetweenBodyParts(bodyParts.leftWrist, bodyParts.rightWrist);
    }
}


/* ----- setup bodystream and run ------ */

// sets up a bodystream with configuration object
const bodyStream = new BodyStream({
    posenet: posenet,
    architecture: modelArchitecture.MobileNetV1,
    detectionType: detectionType.singleBody,
    videoElement: document.getElementById('video'),
    samplingRate: 250
})

// listen for bodies detected and set global variable 'body' when a body
bodyStream.addEventListener('bodiesDetected', (e) => {
    body = e.detail.bodies.getBodyAt(0)
})

// start body detecting 
bodyStream.start()

// draw video and body parts into canvas continously 
drawCameraIntoCanvas();