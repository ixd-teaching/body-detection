
import { detectBodies } from '../../lib/bodydetection.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
import { bodiesToObjectsGenerator } from '../../lib/bodydetection.mjs'
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";

async function run(senderId, sendBtn, status) {

  status.innerHTML = 'Loading model...'
  // creates a remote connection
  const remote = new Remote({
    // If you're running your sketch locally and connecting to a Glitch-hosted processor:
    // url: 'wss://your-project.glitch.me/ws'
  })

  // create a video element connected to the camera feed
  const video = await createCameraFeed(680, 480, facingMode.environmnent)

  // configuration of machine learning framework
  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100
  }

  // send detected body to any listening clients and log to console
  detectBodies(config, (e) => {
    status.innerHTML = 'Sending data...'
    let generator = bodiesToObjectsGenerator(e.detail.bodies)
    for (let bodyObject of generator) {
      // sending data
      remote.send(bodyObject)
   
      // log data to console
      console.log(`Body index: ${bodyObject.bodyIndex}`)
      bodyObject.bodyPartsData.bodyParts2D.forEach(bodyPart => {
        console.log(`${bodyPart.name} (2D), ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)
      })
    }
  })
}

export { run }