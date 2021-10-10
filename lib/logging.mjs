import { bodiesToObjectsGenerator } from '../../lib/bodydetection.mjs'

function logBodies(bodies) {
   let generator = bodiesToObjectsGenerator(bodies)
   for (let bodyObject of generator) {
      console.log(`Body index: ${bodyObject.bodyIndex}`)
      bodyObject.bodyPartsData.bodyParts2D.forEach(bodyPart => {
         console.log(`${bodyPart.name} (2D), ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)
      })
   }
}

export { logBodies }
