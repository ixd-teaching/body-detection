// @ts-nocheck


/* ----- setup ------ */

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// sets up a bodystream with configuration object
const bodyStream = new BodyStream ({
      posenet: posenet,
      architecture: modelArchitecture.MobileNetV1, 
      detectionType: detectionType.singleBody, 
      videoElement: document.getElementById('video'), 
      samplingRate: 250})

// global variable that holds latest detected body in camera stream
let body

// listen for bodies detected and set global variable 'body' when a body is found
bodyStream.addEventListener('bodiesDetected', (e) => {
    body = e.detail.bodies.getBodyAt(0)
})

// draw the video frame with nose and eyes onto canvas
function drawCameraFrameOntoCanvas() {
 
  // draw current frame from the video element onto the canvas
 ctx.drawImage(video, 0, 0, video.width, video.height);
  
 // draw nose and eyes
 if (body) {
    const nose = body.getBodyPart(bodyParts.nose)
    const leftEye = body.getBodyPart(bodyParts.leftEye)
    const rightEye = body.getBodyPart(bodyParts.rightEye)

    // draw nose
    ctx.beginPath();
    ctx.arc(nose.position.x, nose.position.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'red'
    ctx.fill()

    // left and right eye
   drawStar(leftEye.position.x, leftEye.position.y, 5, 5, 13, 'yellow')
   drawStar(rightEye.position.x, rightEye.position.y, 5, 5, 13, 'yellow')
 }
 // 
 window.requestAnimationFrame(drawCameraFrameOntoCanvas);
}

// helper function to draw a star
function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  let step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for(i = 0; i < spikes; i++){
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx,cy - outerRadius)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}


/* ----- run ------ */

// start body detecting 
bodyStream.start()
// draw video and body parts into canvas continuously 
drawCameraFrameOntoCanvas();
