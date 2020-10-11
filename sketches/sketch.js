 // @ts-ignore
const bodies = new BodyStream (posenet, detectionType.singleBody, document.getElementById('video'))
const timeout = 50000

bodies.addEventListener('bodiesDetected', (e) => {
    // @ts-ignore
    console.log(e.detail.bodies.getBodyAt(0).getBodyPart(bodyParts.leftShoulder).position)
})

bodies.start(timeout)