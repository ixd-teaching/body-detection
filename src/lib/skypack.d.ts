
// List out all your dependencies. For every URL, you must map it to its local module. https://docs.skypack.dev/skypack-cdn/code/javascript#using-skypack-urls-in-typescript

declare module 'https://cdn.skypack.dev/@tensorflow-models/pose-detection' {
  export * from '@tensorflow-models/pose-detection'
}

/* export function PosesCallback (poses: Pose[]): void

export class PoseDetectorFromVideo {
    constructor(video: HTMLVideoElement, onPoses: PosesCallback)
    detector: Promise<PoseDetector>
    canRun: boolean
    onPoses: PosesCallback
    video: HTMLVideoElement
    async * detect (): void 
    async run (): void
    async start (): void
    stop (): void
  } */

 