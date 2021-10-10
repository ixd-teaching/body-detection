import * as poseDetection from 'https://cdn.skypack.dev/@tensorflow-models/pose-detection'
import 'https://cdn.skypack.dev/@tensorflow/tfjs-core'
import 'https://cdn.skypack.dev/@tensorflow/tfjs-converter'
import 'https://cdn.skypack.dev/@tensorflow/tfjs-backend-webgl'


// check: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/blazepose_tfjs
// check: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/posenet



class PoseDetector {
   detector
   multiPose = false

   async init(multiPose) {
      this.multiPose = multiPose
      // use PoseNet if detecting more than one pose, otherwise use BlazePose to enable pose detection in 3D 
      if (multiPose) {
         const detectorConfig = {
            modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
            enableTracking: true
         }
         this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig)
      }
      else {
         const detectorConfig = {
            runtime: 'tfjs',
            enableSmoothing: true
         }
         this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, detectorConfig)
      }
   }

   async detect(image, flipHorizontal) {
      if (!this.detector)
         throw "Prediction model not loaded"
      const estimationConfig = {
         maxPoses: this.multiPose ? 2 : 1,
         flipHorizontal: flipHorizontal
      }
      return await this.detector.estimatePoses(image, estimationConfig)
   }
}

class PoseDectorFromVideo extends EventTarget {
   poseDetector
   config
   isRunning = false
   canRun = false
   intervalID
   

   constructor(config) {
      super()
      this.config = config 
      this.poseDetector = new PoseDetector()
   }

   async run() {
      if (this.canRun && this.isRunning) {
         this.canRun = false // cannot run again until pose(s) have been retreived
         let poses = await this.poseDetector.detect(this.config.video, this.config.flipHorizontal)
         if (poses.length > 0)
            this.dispatchEvent(new CustomEvent('posesDetected', {
               detail: {
                  poses: poses,
                  timestamp: Date.now()
               }
            }))
         this.canRun = true
      }
   }

   async start() {
      if (!this.isRunning) {
         await this.poseDetector.init(this.config.multiPose)
         this.isRunning = true
         this.canRun = true
         this.intervalID = setInterval(() => { this.run() }, this.config.sampleRate)
      }
   }

   stop() {
      this.isRunning = false
      clearInterval(this.intervalID)
   }
}

export { PoseDetector, PoseDectorFromVideo }