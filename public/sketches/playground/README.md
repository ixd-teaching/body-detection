## Playground

### Description
The playground helps you see what the framework detects. You can toggle which body parts should be tracked.

### Usage 
As ususal we get a camera feed, configure the framework and get the body data from the event handler handed to 'detectBodies' and  store the result in the variable 'bodies' to be able to access the data subsequently.  

~~~javascript
const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100,
    flipHorizontal: false
  }
  // start listening to bodies in camera-feed
  detectBodies(config, (e) => {
    status.innerHTML = ''

    bodies = e.detail.bodies.listOfBodies

  })
~~~

It is worth noting that the video element is not visible. We manually draw each frame onto a canvas element with data overlaid on top of it continuously:

~~~javascript
 // draw video with overlay onto canvas continuously 
  continuosly(() => drawImageWithOverlay(canvas, video, () => drawBodyParts(canvas, bodies, enabledBodyParts())))
~~~

