// @ts-nocheck
const samplingRate = 250
const bodies = new BodyStream (posenet, detectionType.singleBody, document.getElementById('video'), samplingRate)

bodies.addEventListener('bodiesDetected', (e) => {
    const body = e.detail.bodies.getBodyAt(0)
    console.log(body.getDistanceBetweenBodyParts(bodyParts.leftWrist, bodyParts.rightWrist))
})

bodies.start()