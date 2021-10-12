## Send body data to any remote listeners 

### Description
This sketch demonstrates how to send body data to any remote listeners using Clint's remote class.

### Usage 
As ususal we get a camera feed, configure the framework and get the body data in the event handler handed 'detectBodies'. To able to send data over the wire they need to be translated into a plain javascript object. We do that by getting a 'generator' that can be iterate over in a 'for loop'. In the loop each body is sent. The Remote class will automatically add 'from' field to the object before it is senr that identifies the sender uniquely. See the 'receive-bodies' sketch on how that is used to identify bodies sent from more than one device or browser tab. Finally we log the data sent to the console, which (by a bit of magic) will be shown in the 'log' div on the page. 

~~~javascript
  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100
  }
  // send detected body to any listening clients and log to console
  detectBodies(config, (e) => {
    let generator = bodiesToObjectsGenerator(e.detail.bodies.listOfBodies)
    for (let bodyObject of generator) {
      // sending data
      remote.send(bodyObject)
   
      // log data to console so we can see what is sent
      console.log(`Body id: ${bodyObject.id}`)
      bodyObject.bodyParts3D.forEach(bodyPart => {
        console.log(`${bodyPart.name}, ${bodyPart.position.x}, ${bodyPart.position.y}, ${bodyPart.speed.absoluteSpeed}, ${bodyPart.confidenceScore}`)
      })
    }
  })
  }
~~~

We also output each received body's id and data (position, speed, confidenceScore) of each body part to the console which (by a bit of magic) will be shown in the 'log' div on the page. 

