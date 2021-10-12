## Web framework to play with dynamic body pose detection

### Description

The framework uses tenserflow.js/pose-detection a machine learning model that can detect body poses from a web camera. A pose consists of 33 different bodyparts, e.g. nose, left and right eye, left and right wrist, left and rigt hip, etc. and each body part has a 3D position in space as a confidence score from 0-1, which indicates how 'sure' the machine learning model is about position. It also possible to get the speed of each body part and the distance between two body parts, e.g., between the nose and the right wrist. 

The positional data are in meters and goes from -1 to 1 in all three dimensions. The body's hip is center and will have x=0, y=0, z=0. That means that the body is placed inside a cubic space of 2x2x2m:

Extreme bottom: 1m; Extreme top: -1m

Extreme left: 1m; Extreme right: -1m

Extreme back: 1m; Extreme front: -1m

![cubic space of 2x2x2m](/images/blazepose.gif)

The framework can also detect multiple bodies in a video frame. In that case, though, there is no depth (z), only x and y, and coordinates are measured in pixels not in meters. This can be useful if we want to with a 2D plane (e.g. overlaying a skeleton on the video), but usually we will  want to work with the full 3D data except for multi body detection in the same frame. 

It is, however, possible to use body data from multiple cameras, which can be used for some use cases with multiple bodies.   


### Files and folders
The framework is found in 'lib/bodydetection.js'.
Example sketches are found in 'sketches'.

### Important functions, classes and objects
The important function, classes and objects in the framework are:

*async function createCameraFeed in /lib/camera.mjs*
createCameraFeed creates a html video element an connects it to the web camera, so that we can access the camera feed 

*function detectBodies in /lib/bodydetection.mjs* 
detectBodies emmits an event with body data every time a body is detected in a video frame. detectBodies is configured with the video element created by createCameraFeed as well as other parameters.   

*Class Bodies:*
Bodies contain all data and methods with regard to bodies detected in one video frame. 

*Class Body:*
Body contain all data and methods with regard to a single body detected in a video frame, i.e. body parts and confidence score. The Body class also has methods for relating body parts to each other (e.g. distance between them). The Body class both contains 2D and 3D data (when available) and depending on what we want we can work with either of them. 

*Class BodyPart2D:*
BodyPart contain all 2D data and methods with regard to a single bodypart (e.g. left knee), which is position, speed and confidence score.

*Class BodyPart3D:*
BodyPart contain all 3D data and methods with regard to a single bodypart (e.g. left knee), which is position, speed and confidence score.

*Object bodyPartsList:*
The object bodyPartsList enumerates all body parts. When body parts are referenced we should use the names in bodyPartsList, e.g. 'bodyPartsList.leftEar'.

### Usage
Below is mimimal example of how to create a camera feed, configure and run body detection. This has set multiPose to false, i.e. it can only detects one body (pose) in a video frame. In addition to a configuration object, the detectBodies takes a function that is called when bodies are detected. In this example, we just save the latest body data in the variable 'latestBody' (we get an array of 'bodies', but since we have set multiPose = false, will there only be one body and just take the first element in the array). So the list of bodies is accessible from e.detail.bodies and is of class 'Bodies' and the listOfBodies returns an array of objects of the Body class. 

~~~javascript
    import { detectBodies } from '../../lib/bodydetection.mjs'
    import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
    
    let latestBody

   // create a video element connected to the camera
   // facingMode can be 'environment' (camera towards the environment) or 'user' (camera towards the user)
    const video = await createCameraFeed(640, 480, facingMode.environment)

    const config = {
        video: video,
        multiPose: false,
        sampleRate: 100, // in ms
        flipHorizontal: true // true if webcam

    }
    // start detecting bodies from camera-feed and set latestBody to first (and only) body
    detectBodies(config, (e) => latestBody = e.detail.bodies.listOfBodies[0])
~~~

When we have an object of class Body (in this case latestBody) we can get the data for each body part of the body either 2D or 3D data depending on what we want.  If we want to retrieve data for the right knee, we can write:

~~~javascript
let rightKnee3D = latestBody.getBodyPart3D(bodyPartsList.rightKnee)
let rightKnee2D = latestBody.getBodyPart2D(bodyPartsList.rightKnee)

~~~

Similarly, we can get the distance between two bodyparts :

~~~javascript
let distance3D = latestBody.getDistanceBetweenBodyParts3D(bodyPartsList.leftWrist, bodyParts.rightWrist)
let distance2D = latestBody.getDistanceBetweenBodyParts2D(bodyPartsList.leftWrist, bodyParts.rightWrist)
~~~

Body parts are defined as follows:

~~~javascript
const bodyPartsList = {
    nose: "nose", 
    leftEye: "left_eye", 
    leftEyeInner: "left_eye_inner", 
    leftEyeOuter: "left_eye_outer", 
    rightEyeInner: "right_eye_inner",
    rightEye: "right_eye", 
    rightEyeOuter: "right_eye_outer", 
    leftEar: "left_ear", 
    rightEar: "left_ear",
    mouthLeft: "mouth_left", 
    mouthRight: "mouth_right", 
    leftShoulder: "left_shoulder", 
    rightShoulder: "right_shoulder",
    leftElbow: "left_elbow", 
    rightElbow: "right_elbow", 
    leftWrist: "left_wrist", 
    rightWrist: "right_wrist",
    leftPinky: "left_pinky", 
    rightPinky: "right_pinky", 
    leftIndex: "left_index", 
    rightIndex: "right_index",
    leftThumb: "left_thumb", 
    rightThumb: "right_thumb", 
    leftHip: "left_hip", 
    rightHip: "right_hip",
    leftKnee: "left_knee", 
    rightKnee: "right_knee", 
    leftAnkle: "left_ankle", 
    rightAnkle: "right_ankle",
    leftHeel: "left_heel", 
    rightHeel: "right_heel", 
    leftFootIndex: "left_foot_index", 
    rightFootIndex: "right_foot_index"
}
~~~
### Resources
For a brief introduction to the BlazePose framework see: 
https://blog.tensorflow.org/2021/08/3d-pose-detection-with-mediapipe-blazepose-ghum-tfjs.html 

*Tensorflow*

https://www.tensorflow.org/
