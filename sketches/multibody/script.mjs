
import { detectBodies, bodyPartNames } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawBodyParts } from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'


async function run(canvas, status) {
  let bodies

  // create a video element connected to the camera feed
  status.innerHTML = 'Setting up camera feed...'
  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
    video: video,
    multiPose: true,
    sampleRate: 100
  }
  // start listening to bodies in camera-feed
  status.innerHTML = 'Loading model...'

  detectBodies(config, (e) => {
    status.innerHTML = ''
    bodies = e.detail.bodies.listOfBodies
  })
  function enabledBodyParts() {
    const result = bodyPartNames().reduce((acc, currName) => {
      const checkbox = document.getElementById(currName)
      if (checkbox && checkbox.checked)
        acc.push(currName)
      return acc
    }, [])
    return result
  }
  // draw enabled body parts and their data over the camera feed
  continuosly(() => drawImageWithOverlay(canvas, video, () => drawBodyParts(canvas, bodies, enabledBodyParts())))
}

export { run }