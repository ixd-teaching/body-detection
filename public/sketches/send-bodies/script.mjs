
import { detectBodies } from '../../lib/bodydetection.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
import { bodiesToObjectsGenerator } from '../../lib/bodydetection.mjs'
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";

async function run(status) {

  // creates a remote connection
  const remote = new Remote({
    // If you're running your sketch locally and connecting to a Glitch-hosted processor:
    // url: 'wss://your-project.glitch.me/ws'
  })
  status.innerHTML = 'Setting up camera feed...'

  // create a video element connected to the camera feed
  const video = await createCameraFeed(680, 480, facingMode.environmnent)

  
  // configuration of machine learning framework
  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100
  }
  status.innerHTML = 'Loading model...'
  // send detected body to any listening clients and log to console
  detectBodies(config, (e) => {
    status.innerHTML = 'Detecting bodies and sending data...'
    let generator = bodiesToObjectsGenerator(e.detail.bodies.listOfBodies)
    for (let bodyObject of generator) {
      // sending data
      remote.send(bodyObject)
   
      // log data to console so we can see what is sent
      console.log(`Body id: ${bodyObject.id}`)
      bodyObject.bodyParts3D.forEach(bodyPart => {
        console.log(`${bodyPart.name}, ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)
      })
    }
  })
}

export { run }