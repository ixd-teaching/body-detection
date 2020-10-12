// @ts-nocheck
const samplingRate = 250
const bodies = new BodyStream (posenet, detectionType.singleBody, document.getElementById('video'), samplingRate)
let nose

bodies.addEventListener('bodiesDetected', (e) => {
    const body = e.detail.bodies.getBodyAt(0)
    nose = body.getBodyPart(bodyParts.nose)
})

bodies.start()

// Grab elements, create settings, etc.
let video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");



// Draw the video and noses into the canvas
function drawCameraIntoCanvas() {
 // Draw the video element into the canvas
 ctx.drawImage(video, 0, 0, 640, 480);
  
 // Draw nose if confidenceScore > 0.2
 if (nose && nose.confidenceScore > 0.2) {
    ctx.beginPath();
    ctx.arc(nose.position.x, nose.position.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'red'
    ctx.fill()
 }

  window.requestAnimationFrame(drawCameraIntoCanvas);
}

// Loop over the drawCameraIntoCanvas function
drawCameraIntoCanvas();