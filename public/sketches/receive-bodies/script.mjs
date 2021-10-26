
import { Bodies } from '../../lib/bodydetection.mjs'
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs"
import { bodyPartsList } from '../../lib/bodydetection.mjs'


function run(status) {

  const remote = new Remote({
    // If you're running your sketch locally and connecting to a Glitch-hosted processor:
    url: 'wss://m3-jp-bodydetection.me/ws'
    //useSockets: true,
    //useBroadcastChannel: false
  })

  const bodies = new Bodies([]) // create empty list of bodies

  status.innerHTML = 'Waiting for body data...'

  remote.onData = (data) => {
    status.innerHTML = 'Receiving body data...'
    // create a body from received bodyObject

    bodies.fromArrayOfObjects(data.arrayOfBodyObjects, data.from)

    // update list of bodies with new body data
    if (bodies.listOfBodies.length === 1)
      status.innerHTML = 'Receiving data from 1 body...'
    else
      status.innerHTML = `Receiving data from ${bodies.listOfBodies.length} bodies...`
    

    bodies.listOfBodies.forEach(body => {
      console.log(`Body id: ${body.id}`)
      if (body.bodyParts3D.length > 0) {
        body.bodyParts3D.forEach(bodyPart => {
          console.log(`${bodyPart.name}, ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)

      })}
      else {
        body.bodyParts2D.forEach(bodyPart => {
          console.log(`${bodyPart.name}, ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)

        })
      }
    })
  }
}

export { run }