
import { detectBodies, bodyPartsList } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawSolidCircle, drawStar } from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'

function outputNoseSpeed(status, body) {
  if (body) {
    const speed = body.getBodyPart3D(bodyPartsList.nose).speed.absoluteSpeed.toFixed(2)
    status.innerText = `Speed of nose: ${speed} m/s`
  }
}

function drawNoseAndEyes(canvas, body) {
  if (body) {
    const nose = body.getBodyPart2D(bodyPartsList.nose)
    const leftEye = body.getBodyPart2D(bodyPartsList.leftEye)
    const rightEye = body.getBodyPart2D(bodyPartsList.rightEye)

    // nose
    drawSolidCircle(canvas, nose.position.x, nose.position.y, 10, 'red')

    // left and right eye
    drawStar(canvas, leftEye.position.x, leftEye.position.y, 5, 5, 13, 'yellow')
    drawStar(canvas, rightEye.position.x, rightEye.position.y, 5, 5, 13, 'yellow')
  }
}

async function run(canvas, status) {
  let latestBody

  // create a video element connected to the camera 
  status.innerText = 'Setting up camera feed...'
  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100,
    flipHorizontal: true // true if webcam
  }

  status.innerText = 'Loading model...'
  // start detecting bodies camera-feed a set latestBody to first (and only) body
  detectBodies(config, (e) => latestBody = e.detail.bodies.listOfBodies[0])

  // draw video with nose and eyes overlaid onto canvas continuously and output speed of nose
  continuosly(() => {
    drawImageWithOverlay(canvas, video, () => drawNoseAndEyes(canvas, latestBody))
    outputNoseSpeed(status, latestBody)
  })
}

export { run }