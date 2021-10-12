## Speed of nose

### Description
This sketch demonstrates how to get the speed of a body part in this case 'nose'.

### Usage 
As ususal we get a camera feed, configure the framework and get the body data from the event handler handed 'detectBodies' and store the latest body in 'latestBody'.

~~~javascript
const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)
  let latestBody

  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)
  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100,
    flipHorizontal: true // true if webcam
  }
  // start detecting bodies camera-feed a set latestBody to first (and only) body
  detectBodies(config, (e) => latestBody = e.detail.bodies.listOfBodies[0])
~~~

We manually draw each frame onto a canvas element with data overlaid on top of it continuously:

~~~javascript
  // draw video with nose and eyes overlaid onto canvas continuously and output speed of nose
  continuosly(() => {
    drawImageWithOverlay(canvas, video, () => drawNoseAndEyes(canvas, latestBody))
    outputNoseSpeed(status, latestBody)
  })
~~~

