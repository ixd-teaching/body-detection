
  import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
  import { detectBodies, Body } from '../../lib/bodydetection.mjs'
  import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";

  async function run(status) {

    function sleep(miliseconds) {
      var currentTime = new Date().getTime();

      while (currentTime + miliseconds >= new Date().getTime()) {
      }
    }

    // creates a remote connection
    const remote = new Remote({
      // If you're running your sketch locally and connecting to a Glitch-hosted processor:
      url: 'wss://perfect-elastic-thursday.glitch.me/ws'
      //useSockets: true,
      //useBroadcastChannel: false
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
    // send array of detected bodies to any listening clients and log to console
    detectBodies(config, (e) => {
      status.innerHTML = 'Detecting bodies and sending data...'
      // converts bodies to an array of objects that can be send over the wire
      remote.send({ arrayOfBodyObjects: e.detail.bodies.toArrayOfObjects() })
      // log data to console so we can see what is sent
      e.detail.bodies.listOfBodies.forEach(body => {
        console.log(`Body id: ${body.id}`)
        if (body.bodyParts3D) {
          body.bodyParts3D.forEach(bodyPart =>
            console.log(`${bodyPart.name}, ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`))
        }

        else {
          body.bodyParts2D.forEach(bodyPart =>
            console.log(`${bodyPart.name}, ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`))

        }
      })
    })
  }

  export { run }