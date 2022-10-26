export default PoseDetectorFromVideo

import { PoseDetector, Pose } from '@tensorflow-models/pose-detection'

declare class PoseDetectorFromVideo {
    constructor(video: HTMLVideoElement, onPoses: (poses: Pose[]) => void)
    detector: Promise<PoseDetector>
    canRun: boolean
    onPoses: (poses: Pose[]) => void
    video: HTMLVideoElement
    detect (): Promise<void> 
    run (): Promise<void>
    start (): Promise<void>
    stop (): void
} 

 