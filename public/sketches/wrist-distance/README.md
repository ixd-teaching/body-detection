## Distance between bodyparts (wrists)

### Description
This sketch demonstrates how to get the distance between two body parts in this case left and right wrists.

### Usage 
As ususal we get a camera feed, configure the framework and get the body data from the event handler handed 'detectBodies' and store the latest body in 'latestBody'.

~~~javascript
const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)
  let latestBody

  // create a video element connected to the camera
  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
      video: video,
      multiPose: false,
      sampleRate: 100,
      flipHorizontal: true // true if webcam

  }
  // start detecting bodies from camera-feed a set latestBody to first (and only) body
  detectBodies(config, (e) => latestBody = e.detail.bodies.listOfBodies[0])
~~~

We manually draw each frame onto a canvas element with data overlaid on top of it and output the distance between wrists as well continuously:

~~~javascript
  // draw video with wrists overlaid onto canvas continuously
  continuosly(() => {
      drawImageWithOverlay(canvas, video, () => drawWrists(canvas, latestBody))
      outputDistance(status, latestBody)
  })
~~~

