import { createDetector, SupportedModels, Pose } from "https://cdn.skypack.dev/@tensorflow-models/pose-detection"

// -- domain types

// -- private helper functions --

async function createLiveDetector (video: HTMLVideoElement, onPoses: (poses: Pose[]) => void) {
   const detector = await createDetector(SupportedModels.BlazePose, {runtime: 'tfjs', enableSmoothing: true})
   async function * detect () {
      while (true) 
         yield await detector.estimatePoses(video, {maxPoses: 3, flipHorizontal: true})   
   } 
   let canRun: boolean
   return {
      start: async function () {
         canRun = true
         for await (let poses of detect()) {
            if (canRun)
               break
            onPoses(poses)
         }
      },
      stop: () => canRun = false
   }
}

async function createPoseStream () {

}
export { createLiveDetector as mkLivePoseDetector }