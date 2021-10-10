
import { bodyPart2DNames } from '../../lib/bodydetection.mjs'
import { detectBodies } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawBodyParts } from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'


async function run(canvas) {
  let bodies
  const multiBodies = false

  // create a video element connected to the camera feed
  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
    video: video,
    multiPose: multiBodies,
    sampleRate: 100
  }
  // start listening to bodies in camera-feed
  detectBodies(config, (e) => bodies = e.detail.bodies)
  function enabledBodyParts() {
    const result = bodyPart2DNames().reduce((acc, currName) => {
      if (document.getElementById(currName).checked)
        acc.push(currName)
      return acc
    }, [])
    return result
  }
  // draw enabled body parts and their data over the camera feed
  continuosly(() => drawImageWithOverlay(canvas, video, () => drawBodyParts(canvas, bodies, enabledBodyParts())))
}

export { run }