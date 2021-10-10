
import { bodyPart2DNames } from '../../lib/bodydetection.mjs'
import { detectBodies } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawBodyParts} from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'


async function run(canvas) {
  let bodies

  // create a video element connected to the camera 
  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
    video: video,
    maxPoses: 1,
    sampleRate: 100,
    flipHorizontal: false
  }
  // start listening to bodies in camera-feed
  detectBodies(config, (e) => {
    bodies = e.detail.bodies

  })
  function enabledBodyParts() {
    const result = bodyPart2DNames().reduce((acc, currName) => {
      if (document.getElementById(currName).checked)
        acc.push(currName)
      return acc
    }, [])
    return result
  }
  // draw video with nose and eyes overlaid onto canvas continuously 
  continuosly(() => drawImageWithOverlay(canvas, video, () => drawBodyParts(canvas, bodies, enabledBodyParts())))
}

export { run }