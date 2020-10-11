 // @ts-ignore
const bodies = new BodyStream (posenet, detectionType.singleBody, document.getElementById('video'))
const timeout = 50000

bodies.addEventListener('bodiesDetected', (e) => {
    // @ts-ignore
    const body = e.detail.bodies.getBodyAt(0)
    //console.log(body.getBodyPart(bodyParts.leftShoulder).position)
    console.log(body.getDistanceBetweenBodyParts(bodyParts.leftWrist, bodyParts.rightWrist))
})

bodies.start(timeout)