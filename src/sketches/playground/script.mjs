
import { bodyPartNames } from '../../lib/bodydetection.mjs'
import { detectBodies } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawBodyParts} from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'


async function run(canvas, status) {
  let bodies

  // create a video element connected to the camera 
  status.innerHTML = 'Setting up camera feed...'
  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100,
    flipHorizontal: false
  }
  status.innerHTML = 'Loading model...'
  // start listening to bodies in camera-feed
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
  // draw video with overlay onto canvas continuously 
  continuosly(() => drawImageWithOverlay(canvas, video, () => drawBodyParts(canvas, bodies, enabledBodyParts(), !config.multiPose)))
}

export { run }