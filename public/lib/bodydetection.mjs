import { pipe, fromEvent } from 'https://cdn.skypack.dev/rxjs'
import { map, pairwise } from 'https://cdn.skypack.dev/rxjs/operators'
import { PoseDectorFromVideo } from '../../lib/posedetection.mjs'
import { Queue } from './system.mjs'
import { calcDistance2D3D, calcSpeed2D3D } from './math.mjs'

const bodyPartsList = {
    nose: "nose", leftEye: "left_eye", leftEyeInner: "left_eye_inner", leftEyeOuter: "left_eye_outer", rightEyeInner: "right_eye_inner",
    rightEye: "right_eye", rightEyeOuter: "right_eye_outer", leftEar: "left_ear", rightEar: "right_ear",
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

function getDistanceBetweenBodyParts(bodyPart1, bodyPart2) {
    if (bodyPart1 && bodyPart2) {
        return calcDistance2D3D(bodyPart1.position, bodyPart2.position).absoluteDistance
    } else {
        return 0
    }
}

function getDistanceBetweenBodyParts2D(bodyPart1, bodyPart2) {
    return getDistanceBetweenBodyParts(bodyPart1, bodyPart2)
}

function getDistanceBetweenBodyParts3D(bodyPart1, bodyPart2) {
    return getDistanceBetweenBodyParts(bodyPart1, bodyPart2)
}

// represents a body with bodyparts with 3D data optional depending on TF model used
class Body {
    bodyParts2D
    bodyParts3D
    deviceId = null // optional device id

    constructor(id, bodyParts2D, bodyParts3D, deviceId) {
        this.bodyParts2D = bodyParts2D
        this.bodyParts3D = bodyParts3D
        this.id = id
        this.deviceId = deviceId
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

    // returns id:deviceId if deviceId is defined otherwise just id
    getId() {
        if (this.deviceId)
            return this.id.toString() + ":" + this.deviceId
        else
            return this.id.toString()
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
            bodyParts3D: this.bodyParts3D ? this.bodyParts3D.map((bodyPart3D) => bodyPart3D.toObject()) : [],
            deviceId: this.deviceId
        }
    }
}

function createBodyFromObject(bodyObject) {

    return new Body(
        bodyObject.id,
        bodyObject.bodyParts2D.map(bp => new BodyPart2D({ name: bp.name, position: bp.position, speed: bp.speed, confidenceScore: bp.confidenceScore })),
        bodyObject ? bodyObject.bodyParts3D.map(bp => new BodyPart3D({ name: bp.name, position: bp.position, speed: bp.speed, confidenceScore: bp.confidenceScore })) : null,
        bodyObject.deviceId
    )
}

// translate posenet data to 'Body' type -- prevPose is necessary to calculate change in pose (speed)
function constructBody(id, prevPose, currPose, prevTime, currTime) {
    const timeElapsed = (currTime - prevTime) / 1000 // in seconds
    const bodyParts2D = []
    // create 2D body parts from keypoints
    currPose.keypoints.forEach((curr, i) => {
        const prev = prevPose.keypoints[i]
        bodyParts2D.push(new BodyPart2D(
            {
                name: curr.name,
                position: { x: Math.round(curr.x), y: Math.round(curr.y) },
                speed: calcSpeed2D3D({ x: curr.x, y: curr.y }, { x: prev.x, y: prev.y }, timeElapsed),
                confidenceScore: curr.score.toFixed(2)
            }))
    });
    let bodyParts3D = null
    // if present, create 3D body parts from keypoints
    if ('keypoints3D' in currPose) {
        bodyParts3D = []
        currPose.keypoints3D.forEach((curr, i) => {
            const prev = prevPose.keypoints3D[i]
            bodyParts3D.push(new BodyPart3D(
                {
                    name: curr.name,
                    position: { x: curr.x, y: curr.y, z: curr.z },
                    speed: calcSpeed2D3D({ x: curr.x, y: curr.y, z: curr.z }, { x: prev.x, y: prev.y, z: prev.z }, timeElapsed),
                    confidenceScore: curr.score.toFixed(2)
                }))
        })
    }

    return new Body(id, bodyParts2D, bodyParts3D)
}

// holds a list of bodies
class Bodies {
    listOfBodies // array of Body

    constructor(bodies) {
        this.listOfBodies = bodies
    }

    getBody(id) {
        return this.listOfBodies.find(body => body.getId() === id)
    }

    getDistanceBetweenBodyParts2D(id1, bodyPartName1, id2, bodyPartName2) {
        return calcDistance2D3D(this.getBody(id1).getBodyPart2D(bodyPartName1).position, 
                                this.getBody(id2).getBodyPart2D(bodyPartName2).position)
    }

    getDistanceBetweenBodyParts3D(id1, bodyPartName1, id2, bodyPartName2) {
        return calcDistance2D3D(this.getBody(id1).getBodyPart3D(bodyPartName1).position,
                                this.getBody(id2).getBodyPart3D(bodyPartName2).position)
    }

    // update body data with new data from a particular device
    updateBodies(newBodies, deviceId) {
        // update existing bodies with fresh data by replacing them
        if (this.listOfBodies.length > 0) {
            this.listOfBodies.forEach((body, index) => {
                const newBodyIndex = newBodies.findIndex(newBody => (newBody.getId() === body.getId()))
                if (newBodyIndex != -1)
                    this.listOfBodies[index] = newBodies[newBodyIndex]
            })

        }
        // add new bodies that don't exist
        newBodies.forEach((newBody) => {
            const bodyIndex = this.listOfBodies.findIndex(body => (newBody.getId() === body.getId()))
            if (bodyIndex == -1)
                this.listOfBodies.push(newBody)

        })

        // filter out any old bodies no longer existing on the same device
        this.listOfBodies = this.listOfBodies.filter(body => {
            if (body.deviceId !== deviceId)
                return true
            else
                return (newBodies.findIndex(newBody => (body.getId() === newBody.getId())) !== -1)
        })
    }

    toArrayOfObjects() {
        return this.listOfBodies.map(body => body.toObject())
    }

    fromArrayOfObjects(arrayOfBodyObjects, deviceId) {
        this.updateBodies(arrayOfBodyObjects.map(bodyObject => {
            bodyObject.deviceId = deviceId
            return createBodyFromObject(bodyObject)
        }), deviceId)
    }
}

const movementState = { resting: 'resting', moving: 'moving' }

const defaultStartPosPrecision2D = 10  //in px
const defaultStartPosPrecision3D = 0.05 // in meter


class AnalyzedBodyPart {
    bodyPart
    timestamp
    movingAway
    distanceFromStartPos
    timeFromStart

    constructor({ bodyPart, timestamp, movingAway, distanceFromStartPos, timeFromStart }) {
        this.bodyPart = bodyPart
        this.timestamp = timestamp
        this.movingAway = movingAway
        this.distanceFromStartPos = distanceFromStartPos
        this.timeFromStart = timeFromStart
    }
}

class AnalyzeBodyPartMovement extends EventTarget {
    bodyPartTimeSeries
    startPos
    startTime
    startPosPrecision
    atStartPos

    constructor(length, startPosPrecision) {
        super()
        this.bodyPartTimeSeries = new Queue(length)
        this.startPosPrecision = startPosPrecision
    }

    analyze(bodyPart) {
        const now = Date.now()
        const oldState = this.currentState
        let movingAway
        if (this.bodyPartTimeSeries.length == 0) {
            this.startTime = now
            this.startPos = bodyPart.position
            this.atStartPos = true
            movingAway = false
        }
        else {
            const prevAnalysedBodyPart = this.bodyPartTimeSeries.items[this.bodyPartTimeSeries.length - 1]
            const distanceDiff = calcDistance2D3D(bodyPart.position, this.startPos).absoluteDistance.toFixed(2) - prevAnalysedBodyPart.distanceFromStartPos.toFixed(2)
            if (distanceDiff !== 0) 
                distanceDiff > 0 ? movingAway = true : movingAway = false 

        }
        const analyzedBodyPart = new AnalyzedBodyPart({
            bodyPart: bodyPart,
            timestamp: now,
            movingAway: movingAway,
            distanceFromStartPos: calcDistance2D3D(bodyPart.position, this.startPos).absoluteDistance,
            timeFromStart: now - this.startTime
        })
        this.bodyPartTimeSeries.push(analyzedBodyPart)
        if (analyzedBodyPart.distanceFromStartPos <= this.startPosPrecision) {
            if (!this.atStartPos) {
                this.dispatchEvent(new CustomEvent('backAtStartPos', {
                    detail: { analyzedBodyPart: analyzedBodyPart }
                }))
                this.atStartPos = true
            }
        }
        else {
            if (this.atStartPos) {
                this.dispatchEvent(new CustomEvent('awayFromStartPos', {
                    detail: { analyzedBodyPart: analyzedBodyPart }
                }))
                this.atStartPos = false
            }
        }
        return analyzedBodyPart
    }
}

class AnalyzeBodyMovement extends EventTarget {
    analyzers = []
    bodyPartsToAnalyze

    constructor(bodyPartsToAnalyze, startPosPrecision) {
        super()
        this.bodyPartsToAnalyze = bodyPartsToAnalyze
        this.bodyPartsToAnalyze.forEach(bodyPartName => {
            const analyzer = new AnalyzeBodyPartMovement(500, startPosPrecision)
            analyzer.addEventListener('backAtStartPos', e => this.dispatchEvent(new CustomEvent('backAtStartPos', e)))
            this.analyzers.push({ bodyPartName: bodyPartName, analyzer: analyzer })
            analyzer.addEventListener('awayFromStartPos', e => this.dispatchEvent(new CustomEvent('awayFromStartPos', e)))
            this.analyzers.push({ bodyPartName: bodyPartName, analyzer: analyzer })
        })
    }
    // push newest body data and estimates movement for 
    analyze(body) {
        const analysis = this.analyzers.reduce((analysis, analyzer) => {
            const bodyPart = this.is2D ? body.getBodyPart2D(analyzer.bodyPartName) : body.getBodyPart3D(analyzer.bodyPartName)
            analysis.push(analyzer.analyzer.analyze(bodyPart))
            return analysis
        }, [])
        this.dispatchEvent(new CustomEvent('bodyAnalyzed', {
            detail: { analyzedBodyParts: analysis }
        }))
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
                bodies.push(constructBody(bodyIndex, poseInPrevFrame, poseInCurrFrame, pair[0].timestamp, pair[1].timestamp)) // convert a pose to a body
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

// start detecting bodies and returns a BodyStream
function detectBodies(config, onBodiesDetected) {
    const bs = new BodyStream(config)
    bs.addEventListener('bodiesDetected', onBodiesDetected)
    bs.start()
    return bs
}

export {
    detectBodies,
    movementState,
    AnalyzeBodyMovement,
    BodyStream,
    Body,
    Bodies,
    bodyPartsList,
    bodyPartNames
}