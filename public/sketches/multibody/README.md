## Detecting multiple bodies

### Description
This sketch exemplifies the detection of multiple bodies in one camera feed. The framework has been limited to detect nothing more than 2 bodies, because it becomes too complicated to work with more from an interaction design perspective. It might also degrade the speed on less capable devices.

### Usage 

The imptortant thing to notice in this sketch is just that in the config object 'multipose: true', which means that the framework might return more than one body if detected. The bodies can be retreived from e.detail.bodies.listOfBodies in the eventhandler, which returns an array of detected bodies.
})

~~~javascript
const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

const config = {
   video: video,
   multiPose: true,
   sampleRate: 100
}

detectBodies(config, (e) => {
   status.innerHTML = ''
   bodies = e.detail.bodies.listOfBodies
})
~~~