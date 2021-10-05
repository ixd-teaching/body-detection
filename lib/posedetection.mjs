import * as poseDetection from 'https://cdn.skypack.dev/@tensorflow-models/pose-detection'
import 'https://cdn.skypack.dev/@tensorflow/tfjs-core'
import 'https://cdn.skypack.dev/@tensorflow/tfjs-converter'
import 'https://cdn.skypack.dev/@tensorflow/tfjs-backend-webgl'


// check: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/blazepose_tfjs
// check: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/posenet

class PoseDetector {
   detector

   async init(maxPoses) {
      // use PoseNet if detecting more than one pose, otherwise use BlazePose to enable pose detection in 3D 
      if (maxPoses > 1) {
         const detectorConfig = {
            modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
            enableTracking: true
         }
         this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.PoseNet, detectorConfig)
      }
      else
         this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, { runtime: 'tfjs', modelType: 'full' })
   }

   async detect(image) {
      if (!this.detector)
         throw "Prediction model not loaded"
      return await this.detector.estimatePoses(image)
   }
}

class PoseDectorFromVideo extends EventTarget {
   poseDetector
   sampleRate
   maxPoses
   isRunning = false
   canRun = false
   intervalID
   video

   constructor(config) {
      super ()
      this.poseDetector = new PoseDetector()
      this.video = config.video
      this.sampleRate = config.sampleRate
      this.maxPoses = config.maxPoses
   }

   async run() {
      if (this.canRun && this.isRunning) {
         this.canRun = false // cannot run again until pose(s) have been retreived
         let poses = await this.poseDetector.detect(this.video)
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
         await this.poseDetector.init(this.maxPoses)
         this.isRunning = true
         this.canRun = true
         this.intervalID = setInterval(() => { this.run() }, this.sampleRate)
      }
   }

   stop() {
      this.isRunning = false
      clearInterval(this.intervalID)
   }
}

export { PoseDetector, PoseDectorFromVideo }