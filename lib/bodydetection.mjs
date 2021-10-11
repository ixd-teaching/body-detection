import { pipe, fromEvent } from 'https://cdn.skypack.dev/rxjs'
import { map, pairwise } from 'https://cdn.skypack.dev/rxjs/operators'
import { PoseDectorFromVideo } from '../../lib/posedetection.mjs'

/* const bodyParts2D = {
    nose: "nose", leftEye: "left_eye", rightEye: "right_eye", leftEar: "left_ear", rightEar: "right_ear",
    leftShoulder: "left_shoulder", rightShoulder: "right_shoulder", leftElbow: "left_elbow", rightElbow: "right_elbow",
    leftWrist: "left_wrist", rightWrist: "right_wrist", leftHip: "left_hip", rightHip: "right_hip", leftKnee: "left_knee",
    rightKnee: "right_knee", leftAnkle: "left_ankle", rightAnkle: "right_ankle"
} */

const bodyPartsList = {
    nose: "nose", leftEye: "left_eye", leftEyeInner: "left_eye_inner", leftEyeOuter: "left_eye_outer", rightEyeInner: "right_eye_inner",
    rightEye: "right_eye", rightEyeOuter: "right_eye_outer", leftEar: "left_ear", rightEar: "left_ear",
    mouthLeft: "mouth_left", mouthRight: "mouth_right", leftShoulder: "left_shoulder", rightShoulder: "right_shoulder",
    leftElbow: "left_elbow", rightElbow: "right_elbow", leftWrist: "left_wrist", rightWrist: "right_wrist",
    leftPinky: "left_pinky", rightPinky: "right_pinky", leftIndex: "left_index", rightIndex: "right_index",
    leftThumb: "left_thumb", rightThumb: "right_thumb", leftHip: "left_hip", rightHip: "right_hip",
    leftKnee: "left_knee", rightKnee: "right_knee", leftAnkle: "left_ankle", rightAnkle: "right_ankle",
    leftHeel: "left_heel", rightHeel: "right_heel", leftFootIndex: "left_foot_index", rightFootIndex: "right_foot_index"
}

const bodyPartNames = () => Object.values(bodyPartsList)

// represents data of a 2D bodypart
class BodyPart2D {
    name
    position // in px
    speed // in px/s
    confidenceScore

    constructor({ name, position, speed, confidenceScore }) {
        this.name = name
        this.position = position
        this.speed = speed
        this.confidenceScore = confidenceScore
    }

    toObject() {
        return { name: this.name, position: this.position, speed: this.speed, confidenceScore: this.confidenceScore }
    }
}

class BodyPart3D {
    name
    position // x,y,z from -1 to 1 m 
    speed // in m/s
    confidenceScore

    constructor({ name, position, speed, confidenceScore }) {
        this.name = name
        this.position = position
        this.speed = speed
        this.confidenceScore = confidenceScore
    }
    toObject() {
        return { name: this.name, position: this.position, speed: this.speed, confidenceScore: this.confidenceScore }
    }
}

function getDistanceBetweenBodyParts2D (bodyPart1, bodyPart2) {
    if (bodyPart1 !== null && bodyPart1 !== undefined && bodyPart2 !== null && bodyPart2 !== undefined) {
        const distanceX = bodyPart1.position.x - bodyPart2.position.x
        const distanceY = bodyPart1.position.y - bodyPart2.position.y
        return Math.hypot(distanceX, distanceY)
    } else {
        return 0
    }
}

function getDistanceBetweenBodyParts3D(bodyPart1, bodyPart2) {
    if (bodyPart1 !== null && bodyPart1 !== undefined && bodyPart2 !== null && bodyPart2 !== undefined) {
        const distanceX = bodyPart1.position.x - bodyPart2.position.x
        const distanceY = bodyPart1.position.y - bodyPart2.position.y
        const distanceZ = bodyPart1.position.z - bodyPart2.position.z
        return Math.hypot(distanceX, distanceY, distanceZ)
    } else {
        return 0
    }
}
// represents a body with bodyparts with 3D data optional depending on TF model used
class Body {
    bodyParts2D
    bodyParts3D
    id

    constructor(id, bodyParts2D, bodyParts3D) {
        this.bodyParts2D = bodyParts2D
        this.bodyParts3D = bodyParts3D
        this.id = id
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
        return getDistanceBetweenBodyParts2D(this.getBodyPart2D(name1), this.getBodyPart2D(name2))
    }

    // if no 3D data exists (because the body detection is configured to multipose = true), distance '0' is returned
    getDistanceBetweenBodyParts3D(name1, name2) {
        return getDistanceBetweenBodyParts3D(this.getBodyPart3D(name1), this.getBodyPart3D(name2))
    }

    toObject() {
        return {
            id: this.id,
            bodyParts2D: this.bodyParts2D.map((bodyPart2D) => bodyPart2D.toObject()),
            bodyParts3D: this.bodyParts3D ? this.bodyParts3D.map((bodyPart3D) => bodyPart3D.toObject()) : null
        }
    }
}

function createBodyFromObject(bodyObject) {
    return new Body(
        bodyObject.id,
        bodyObject.bodyParts2D.map(bp => new BodyPart2D({name: bp.name, position: bp.position, speed: bp.speed, confidenceScore: bp.confidenceScore})),
        bodyObject ? bodyObject.bodyParts3D.map(bp => new BodyPart3D({name: bp.name, position: bp.position, speed: bp.speed, confidenceScore: bp.confidenceScore})) : null
    )
}


// translate posenet data to 'Body' type -- prevPose is necessary to calculate change in pose (speed)
function constructBody(id, prevPose, currPose, timeLapsed) {
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
        bodyParts2D.push(new BodyPart2D(
            {
                name: curr.name,
                position: { x: Math.round(curr.x), y: Math.round(curr.y) },
                speed: speed,
                confidenceScore: curr.score.toFixed(2)
            }))
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
            bodyParts3D.push(new BodyPart3D(
                {
                    name: curr.name,
                    position: { x: curr.x, y: curr.y, z: curr.z },
                    speed: speed,
                    confidenceScore: curr.score.toFixed(2)
                }))
        })
    }

    return new Body(id, bodyParts2D, bodyParts3D)
}

// holds a list of bodies
class Bodies {
    listOfBodies

    constructor (bodies) {
        this.listOfBodies = bodies
    }

    getBody(id) {
        return this.listOfBodies.find(body => body.id === id)
    }

    getDistanceBetweenBodyParts2D({ id1, bodyPartName1, id2, bodyPartName2 }) {
        const body1 = this.getBody(id1)
        const body2 = this.getBody(id2)
        return getDistanceBetweenBodyParts2D(body1, bodyPartName1, body2, bodyPartName2)
    }

    getDistanceBetweenBodyParts3D({ id1, bodyPartName1, id2, bodyPartName2 }) {
        const body1 = this.getBody(id1)
        const body2 = this.getBody(id2)
        return getDistanceBetweenBodyParts2D(body1, bodyPartName1, body2, bodyPartName2)
    }

    // update body data if body already exists, otherwise add body to list
    updateBody(newBody) {
        for (let i = 0; i < this.listOfBodies.length; i++)
            if (this.listOfBodies[i].id.localeCompare(newBody.id) === 0) {
                this.listOfBodies[i] = newBody
                return
            }
        this.listOfBodies.push(newBody)
    }
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
            posesInCurrFrame.forEach((poseInCurrFrame, bodyIndex) => {
                let poseInPrevFrame = bodyIndex > posesInPrevFrame.length - 1 ? poseInCurrFrame : posesInPrevFrame[bodyIndex]
                bodies.push(constructBody(bodyIndex, poseInPrevFrame, poseInCurrFrame, pair[1].timestamp - pair[0].timestamp)) // convert a pose to a body
            })
            return bodies
        }))
        bodies$.subscribe((bodies) => {
            // emits moving body data to listeners 
            this.dispatchEvent(new CustomEvent('bodiesDetected', {
                detail: { bodies: new Bodies(bodies) }
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

function* bodiesToObjectsGenerator(bodies) {
    for (const body of bodies)
        yield body.toObject()
}


export {
    detectBodies, 
    Body, 
    Bodies, 
    bodyPartsList, 
    bodyPartNames, 
    createBodyFromObject, 
    bodiesToObjectsGenerator
}