import { detectBodies, bodyParts2D, bodyParts3D } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawSolidCircle } from '../utils/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed } from '../utils/video.mjs'
import { SerialConnection } from '../utils/serial.mjs'


// draw the video, nose and eyes into the canvas
function drawBodyParts(canvas, bodies) {

   if (bodies) {
      bodies.forEach(body => {
         // draw circle for each bodyPart
         const confidenceTreshhold = 0.75
         const ctx = canvas.getContext("2d")
         let yOffset = 20
         let xOffset = 10
         Object.values(bodyParts2D).forEach(bodyPartName => {
            if (document.getElementById(bodyPartName).checked) {
               let bodyPart2D = body.getBodyPart2D(bodyPartName)
               let bodyPart3D = body.getBodyPart3D(bodyPartName)
               let { x, y, z } = bodyPart3D.position
               let speed = bodyPart3D.speed.absoluteSpeed
               let confidenceScore = bodyPart3D.confidenceScore

               drawSolidCircle(canvas, bodyPart2D.position.x, bodyPart2D.position.y, 10, 'white', confidenceScore)

               ctx.font = "12px 'Arial'"
               ctx.fillText(`${bodyPartName}`, xOffset, yOffset)
               ctx.fillText(`x: ${x.toFixed(2)}`, xOffset, 15 + yOffset)
               ctx.fillText(`y: ${y.toFixed(2)}`, xOffset, 30 + yOffset)
               ctx.fillText(`z: ${z.toFixed(2)}`, xOffset, 45 + yOffset)

               ctx.fillText(`speed: ${speed.toFixed(2)}`, xOffset, 60 + yOffset)
               ctx.fillText(`confidence: ${confidenceScore}`, xOffset, 75 + yOffset)
               if (yOffset > canvas.height - 120) {
                  yOffset = 20
                  xOffset = 130
               }
               else {
                  yOffset = yOffset + 80
               }
            }
         })
      })
   }
}

function serializeBodyPart(name, body, bodyIndex, bodyPartIndex) {
   const bodyPart = body.getBodyPart3D(name)
   const {x, y, z} = bodyPart.position
   const absoluteSpeed = bodyPart.speed.absoluteSpeed
   const confidenceScore = bodyPart.confidenceScore
   return `${name},${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)},${absoluteSpeed.toFixed(2)},${confidenceScore}\n`
}

function bodyPartEnabled(name) {
   return !document.getElementById(name) ? false : document.getElementById(name).checked
}

class Bodies2Microbit {
   canvas
   connected = false
   serial

   constructor(canvas, connectBtn) {
      this.canvas = canvas
      this.serial = new SerialConnection()
      connectBtn.addEventListener('click', async () => {
         await this.serial.toggle()
         this.serial.connected ? connectBtn.innerText = 'Disconnect' : connectBtn.innerText = 'Connect'
      })
   }

   async run() {
      let bodies

      // create a video element connected to the camera 
      const video = await createCameraFeed(this.canvas.width, this.canvas.height, 'environment')

      const config = {
         video: video,
         maxPoses: 1,
         sampleRate: 100
      }
      // start listening to bodies in camera-feed and write bodyparts to microbit
      detectBodies(config, (e) => {
         bodies = e.detail.bodies
         bodies.forEach((body, bodyIndex) => {
            Object.values(bodyParts3D).forEach((bodyPartName, bodyPartIndex) => {
               if (bodyPartEnabled(bodyPartName))
                  this.serial.write(serializeBodyPart(bodyPartName, body, bodyIndex, bodyPartIndex))
            })
         })
      })

      // draw body parts overlaid onto canvas continuously 
      continuosly(() => drawImageWithOverlay(canvas, video, () => drawBodyParts(canvas, bodies)))
   }

}
export { Bodies2Microbit }