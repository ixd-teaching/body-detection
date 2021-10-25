## Tracking repetitive movement  

### Description
This sketch demonstrates how to track when a body part is moving away from and coming back to the starting position. The continuous distance to the starting point can also be tracked. This allows for example for tracking circular movements and know how far or close a moving body part is to the starting point. 

### Usage 
As ususal we get a camera feed, configure the framework and get the body data in the event handler handed 'detectBodies'. We setup an AnalyseBodyMovement class with the bodyparts we want to analyze (enbableBodyParts) and 'startPosPrecision'. startPosPrecision is a measure of how 'close' the body part should be to the original start position to be deemed to have hit the start position again. startPosPosition should be either in meters or pixels depending on whether 2D or 3D data are used.

~~~javascript
  // configuration of machine learning framework
  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100
  }
  const enabledBodyParts = [bodyPartsList.nose]
  const analyzeBodyMovement = new AnalyzeBodyMovement(enabledBodyParts, 0.1)
  status.innerHTML = 'Loading model...'
  detectBodies(config, (e) => {
    listOfBodies = e.detail.bodies.listOfBodies
    analyzeBodyMovement.analyze(listOfBodies[0])
  })
~~~

When a body is received we call 'analyze' on the 'analyzeBodyMovement' class which will emit analysis data when analysis is done. The analysis data is setup via these event listeners: 

~~~javascript
    analyzeBodyMovement.addEventListener('bodyAnalyzed', e => {
    e.detail.analyzedBodyParts.forEach(analyzedBodyPart => {
          status.innerHTML = `Distance from start: ${analyzedBodyPart.distanceFromStartPos.toFixed(2)}`
    })
  })

  analyzeBodyMovement.addEventListener('awayFromStartPos', e => {
    const analyzedBodyPart = e.detail.analyzedBodyPart
    console.log(`Away from start position: ${analyzedBodyPart.bodyPart.name}`)
  })

  analyzeBodyMovement.addEventListener('backAtStartPos', e => {
    const analyzedBodyPart = e.detail.analyzedBodyPart
    console.log(`Back at start position: ${analyzedBodyPart.bodyPart.name}`)
  })

  })
~~~

The 'bodyAnalyzed' event is called when the body's movement has been analyzed and returns a list of 'AnalyzedBodyParts', which holds the analysis data of each body part. 'awayFromStartPos' is emitted when the body part has moved away from the start position. 'backAtStartPos' is emitted when the body part is back at the starting position.

