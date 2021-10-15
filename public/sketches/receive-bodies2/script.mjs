
import { createBodyFromObject, Bodies } from '../../lib/bodydetection.mjs'
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";

function run(status) {

  const remote = new Remote({
    // If you're running your sketch locally and connecting to a Glitch-hosted processor:
    // url: 'wss://your-project.glitch.me/ws'
  })

  const bodies = new Bodies([]) // create empty list of bodies

  status.innerHTML = 'Waiting for body data...'

  remote.onData = (bodyObject) => {
    status.innerHTML = 'Receiving body data...'
    // create a body from received bodyObject
    const body = createBodyFromObject(bodyObject)

    // we are adding device id to body' id to uniquely identify body if receiving data from more than one device
    body.id = body.id + ':' + bodyObject.from

    // update list of bodies with new body data
    bodies.updateBody(body)
    if (bodies.listOfBodies.length === 1)
      status.innerHTML = 'Receiving data from 1 body...'
    else
      status.innerHTML = `Receiving data from ${bodies.listOfBodies.length} bodies...`

    console.log(`Body id: ${body.id}`)
    body.bodyParts3D.forEach(bodyPart => {
        console.log(`${bodyPart.name}, ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)
      })
  }
}

export { run }