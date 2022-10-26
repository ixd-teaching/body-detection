## Distance between bodies

### Description
This sketch demonstrates how to find the distance between two body parts on two different bodies in this case the nose on the first body and the wrist on the second body

### Usage 
We the distance between two bodyparts on two different bodies by calling either 'getDistanceBetweenBodyParts2D' or 'getDistanceBetweenBodyParts3D'. The latter method can only be called if 'multipose = false' in the configuration of the framework, which in turn means that the two bodies must come from two different devices (see the receive-bodies sketch to understand how to work with body data from more than one device). In cases where only 2D data are used you don't need to worry about that.

getDistanceBetweenBodyParts2D/3D takes a body id and body part pr. body. Get the body id by calling Body.getId()

})

~~~javascript
  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
    video: video,
    multiPose: true,
    sampleRate: 100
  }
  // start listening to bodies in camera-feed
  status.innerHTML = 'Loading model...'

  detectBodies(config, (e) => {
    status.innerHTML = ''
    const bodies = e.detail.bodies
    if (bodies.listOfBodies.length > 1) {
      const id1 = bodies.listOfBodies[0].getId()
      const id2 = bodies.listOfBodies[1].getId()
      status.innerHTML = `Distance between body parts: ${bodies.getDistanceBetweenBodyParts2D(id1, bodyPartsList.nose, id2, bodyPartsList.rightWrist).absoluteDistance}`
    } 
  })

  // draw camera feed on canvas
  continuosly(() => drawImageOnCanvas(canvas, video))
~~~