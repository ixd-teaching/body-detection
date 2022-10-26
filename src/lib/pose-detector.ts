import { createDetector, SupportedModels, Pose } from "https://cdn.skypack.dev/@tensorflow-models/pose-detection"

// -- domain types

// -- private helper functions --

async function createLivePoseDetector (video: HTMLVideoElement, onPoses: (poses: Pose[]) => void) {
   let canRun: boolean
   const detector = await createDetector(SupportedModels.BlazePose, {runtime: 'tfjs', enableSmoothing: true})
   async function * detect () {
      while (true) 
         yield await detector.estimatePoses(video, {maxPoses: 3, flipHorizontal: true})   
   } 
   return {
      start: async function () {
         canRun = true
         for await (let poses of detect()) {
            if (canRun)
               break
            onPoses(poses)
         }
      },
      stop: () => canRun = true
   }
}

async function mkPoseStream () {

}
export { createLivePoseDetector as mkLivePoseDetector }