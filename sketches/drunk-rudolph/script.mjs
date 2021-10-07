
import { detectBodies, bodyParts2D, bodyParts3D } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawSolidCircle, drawStar } from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed } from '../../lib/video.mjs'

function outputNoseSpeed(output, body) {
  if (body) {
    const speed = body.getBodyPart3D(bodyParts3D.nose).speed.absoluteSpeed.toFixed(2)
    output.innerText = `Speed of nose: ${speed} m/s`
  }
}

function drawNoseAndEyes(canvas, body) {
  if (body) {
    const nose = body.getBodyPart2D(bodyParts2D.nose)
    const leftEye = body.getBodyPart2D(bodyParts2D.leftEye)
    const rightEye = body.getBodyPart2D(bodyParts2D.rightEye)

    // nose
    drawSolidCircle(canvas, nose.position.x, nose.position.y, 10, 'red')

    // left and right eye
    drawStar(canvas, leftEye.position.x, leftEye.position.y, 5, 5, 13, 'yellow')
    drawStar(canvas, rightEye.position.x, rightEye.position.y, 5, 5, 13, 'yellow')
  }
}

async function run(canvas, output) {
  let latestBody

  // create a video element connected to the camera 
  const video = await createCameraFeed(canvas.width, canvas.height, 'environment')

  const config = {
    video: video,
    maxPoses: 1,
    sampleRate: 100,
    flipHorizontal: false
  }
  // start listening to bodies in camera-feed
  detectBodies(config, (e) => {
    latestBody = e.detail.bodies[0]

  })

  // draw video with nose and eyes overlaid onto canvas continuously 
  continuosly(() => {
    outputNoseSpeed(output, latestBody)
    drawImageWithOverlay(canvas, video, () => drawNoseAndEyes(canvas, latestBody))
  })
}

export { run }