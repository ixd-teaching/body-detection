
/* ----- setup bodystream and run ------ */

// sets up a bodystream with configuration object
const bodyStream = new BodyStream({
   posenet: posenet,
   architecture: modelArchitecture.MobileNetV1,
   detectionType: detectionType.singleBody,
   videoElement: document.getElementById('video'),
   samplingRate: 250
})

function serializeBody (body) {

   function serializeBodyPart (name) {
      let bodyPart = body.getBodyPart(name)
      return `:${name},${bodyPart.position.x},${bodyPart.position.y},${bodyPart.speed.absoluteSpeed},${bodyPart.confidenceScore}`
   }
   
   return Object.values(bodyParts).reduce((prev, curr, index) => 
      (index === 1) ? serializeBodyPart(prev)+serializeBodyPart(curr) : prev+serializeBodyPart(curr)
   ) + "\n"
}

// listen for bodies detected and set global variable 'body' when a body
bodyStream.addEventListener('bodiesDetected', (e) => {
   console.log(serializeBody(e.detail.bodies.getBodyAt(0)))
})

// start body detecting 
bodyStream.start()

