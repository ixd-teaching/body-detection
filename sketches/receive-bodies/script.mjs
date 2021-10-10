
import { detectBodies } from '../../lib/bodydetection.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
import { logBodies } from '../../lib/logging.mjs'
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";



async function run(senderId, sendBtn, status) {

  const remote = new Remote({
    // If you're running your sketch locally and connecting to a Glitch-hosted processor:
    // url: 'wss://your-project.glitch.me/ws'
  })

  remote.onData = (bodies) => {
    const freq = d.freq;
    const wave = d.wave;
    remote.send(e.detail.bodies)
    logBodies(e.detail.bodies, (bodyObject) => {
      console.log(`Body index: ${bodyObject.bodyIndex}`)
      bodyObject.bodyPartsData.bodyParts2D.forEach(bodyPart => {
        console.log(`${bodyPart.name} (2D), ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)
      })
    })
  }
}

export { run }