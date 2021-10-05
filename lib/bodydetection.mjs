import { pipe, fromEvent } from 'https://cdn.skypack.dev/rxjs'
import { map, pairwise } from 'https://cdn.skypack.dev/rxjs/operators'
import { PoseDectorFromVideo } from '../../lib/posedetection.mjs'

const bodyParts2D = {
    nose: "nose", leftEye: "left_eye", rightEye: "right_eye", leftEar: "left_ear", rightEar: "right_ear",
    leftShoulder: "left_shoulder", rightShoulder: "right_shoulder", leftElbow: "left_elbow", rightElbow: "right_elbow",
    leftWrist: "left_wrist", rightWrist: "right_wrist", leftHip: "left_hip", rightHip: "right_hip", leftKnee: "left_knee",
    rightKnee: "right_knee", leftAnkle: "left_ankle", rightAnkle: "right_ankle"
}

const bodyParts3D = {
    nose: "nose", leftEyeInner: "left_eye_inner", leftEyeOuter: "left_eye_outer", rightEyeInner: "right_eye_inner",
    rightEye: "right_eye", rightEyeOuter: "right_eye_outer", leftEar: "left_ear", rightEar: "left_ear",
    mouthLeft: "mouth_left", mouthRight: "mouth_right", leftShoulder: "left_shoulder", rightShoulder: "right_shoulder",
    leftElbow: "left_elbow", rightElbow: "right_elbow", leftWrist: "left_wrist", rightWrist: "right_wrist",
    leftPinky: "left_pinky", rightPinky: "right_pinky", leftIndex: "left_index", rightIndex: "right_index",
    leftThumb: "left_thumb", rightThumb: "right_thumb", leftHip: "left_hip", rightHip: "right_hip",
    leftKnee: "left_knee", rightKnee: "right_knee", leftAnkle: "left_ankle", rightAnkle: "right_ankle",
    leftHeel: "left_heel", rightHeel: "right_heel", leftFootIndex: "left_foot_index", rightFootIndex: "right_foot_index"
}

// represents data of a 2D bodypart
class BodyPart2D {
    name
    position // in px
    speed // in px/s
    confidenceScore

    constructor(name, position, speed, confidenceScore) {
        this.name = name
        this.position = position
        this.speed = speed
        this.confidenceScore = confidenceScore
    }
}

class BodyPart3D {
    name
    position // x,y,z from -1 to 1 m 
    speed // in m/s
    confidenceScore

    constructor(name, position, speed, confidenceScore) {
        this.name = name
        this.position = position
        this.speed = speed
        this.confidenceScore = confidenceScore
    }
}

// represents a body with bodyparts with 3D data optional depending on TF model used
class Body {
    bodyParts2D
    bodyParts3D

    constructor(bodyParts2D, bodyParts3D) {
        this.bodyParts2D = bodyParts2D
        this.bodyParts3D = bodyParts3D
    }

    has3DBodyParts() {
        return !bodyParts3D ? false : true
    }

    #getBodyPart(name, bodyParts) {
        let result = null
        for (const bodyPart of bodyParts) {
            if (bodyPart.name === name) {
                result = bodyPart
                break
            }
        }
        return result
    }

    getBodyPart2D(name) {
        return this.#getBodyPart(name, this.bodyParts2D)
    }

    getBodyPart3D(name) {
        return this.#getBodyPart(name, this.bodyParts3D)
    }

    getDistanceBetweenBodyParts2D(name1, name2) {
        const fstBodyPart = this.getBodyPart2D(name1)
        const sndBodyPart = this.getBodyPart2D(name2)
        if (fstBodyPart && sndBodyPart) {
            const distanceX = fstBodyPart.position.x - sndBodyPart.position.x
            const distanceY = fstBodyPart.position.y - sndBodyPart.position.y
            return Math.hypot(distanceX, distanceY)
        } else {
            return 0
        }
    }

    getDistanceBetweenBodyParts3D(name1, name2) {
        const fstBodyPart = this.getBodyPart3D(name1)
        const sndBodyPart = this.getBodyPart3D(name2)
        if (fstBodyPart && sndBodyPart) {
            const distanceX = fstBodyPart.position.x - sndBodyPart.position.x
            const distanceY = fstBodyPart.position.y - sndBodyPart.position.y
            const distanceZ = fstBodyPart.position.z - sndBodyPart.position.z
            return Math.hypot(distanceX, distanceY, distanceZ)
        } else {
            return 0
        }
    }
}

// translate posenet data to 'Body' type -- prevPose is necessary to calculate change in pose (speed)
function constructBody(prevPose, currPose, timeLapsed) {
    const bodyParts2D = []
    // create 2D body parts from keypoints
    currPose.keypoints.forEach((curr, i) => {
        const prev = prevPose.keypoints[i]
        // calculates speed
        const distanceX = curr.x - prev.x
        const distanceY = curr.y - prev.y
        const speedX = Math.round(distanceX / (timeLapsed / 1000))
        const speedY = Math.round(distanceY / (timeLapsed / 1000))
        const speed = {
            vector: { x: speedX, y: speedY },
            absoluteSpeed: Math.round(Math.hypot(speedX, speedY))
        }
        bodyParts2D.push(new BodyPart2D(curr.name, { x: Math.round(curr.x), y: Math.round(curr.y) }, speed, curr.score.toFixed(2)))
    });
    let bodyParts3D = null
    // if present, create 3D body parts from keypoints
    if ('keypoints3D' in currPose) {
        bodyParts3D = []
        currPose.keypoints3D.forEach((curr, i) => {
            const prev = prevPose.keypoints3D[i]
            // calculates speed
            const distanceX = curr.x - prev.x
            const distanceY = curr.y - prev.y
            const distanceZ = curr.z - prev.z
            const speedX = distanceX / (timeLapsed / 1000)
            const speedY = distanceY / (timeLapsed / 1000)
            const speedZ = distanceZ / (timeLapsed / 1000)
            const speed = {
                vector: { x: speedX, y: speedY, speedZ: speedZ },
                absoluteSpeed: Math.hypot(speedX, speedY, speedZ)
            }
            bodyParts3D.push(new BodyPart3D(curr.name, { x: curr.x, y: curr.y, z: curr.z }, speed, curr.score.toFixed(2)))
        })
    }

    return new Body(bodyParts2D, bodyParts3D)
}


// sends moving bodies data from video stream to any listening clients
class BodyStream extends EventTarget {

    setupStream() {
        const poses$ = fromEvent(this.poseDector, 'posesDetected').pipe(map(e => e.detail))
        const pairs$ = poses$.pipe(pairwise())
        const bodies$ = pairs$.pipe(map(pair => { // take a pair of poses to be able to calculate change in pose over time (speed) 
            const posesInPrevFrame = pair[0].poses
            const posesInCurrFrame = pair[1].poses
            const bodies = []
            posesInCurrFrame.forEach((poseInCurrFrame, index) => {
                let poseInPrevFrame = index > posesInPrevFrame.length - 1 ? poseInCurrFrame : posesInPrevFrame[index]
                bodies.push(constructBody(poseInPrevFrame, poseInCurrFrame, pair[1].timestamp - pair[0].timestamp)) // convert a pose to a body
            })
            return bodies
        }))
        bodies$.subscribe((bodies) => {
            // emits moving body data to listeners 
            this.dispatchEvent(new CustomEvent('bodiesDetected', {
                detail: { bodies: bodies }
            }))
        })
    }

    constructor(config) {
        super()
        this.poseDector = new PoseDectorFromVideo(config)
        this.setupStream()
    }

    start() {
        this.poseDector.start()
    }

    stop() {
        this.poseDector.stop()
    }
}

// start detecting bodies
function detectBodies(config, onBodiesDetected) {
    const bs = new BodyStream(config)
    bs.addEventListener('bodiesDetected', onBodiesDetected)
    bs.start()
}

export { detectBodies, Body, BodyPart2D, bodyParts2D, bodyParts3D }