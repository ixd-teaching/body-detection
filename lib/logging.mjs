import { bodiesToObjectsGenerator } from '../../lib/bodydetection.mjs'

function logBodies(bodies, loggingFunc) {
   let generator = bodiesToObjectsGenerator(bodies)
   for (let bodyObject of generator) {
      loggingFunc(bodyObject)

   }
}

export { logBodies }
