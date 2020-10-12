### Web framework to play with dynamic body pose detection

#### Description

The framework uses tenserflow.js/posenet to detect one or more bodies from the browser's camera and emmits positional data for each body's body parts. The framework can use either of two model architectures from posenet: 'MobileNetV1' (default) or 'ResNet50'. ResNet50 is more precise, but also slower and consumes more resources. The framework can be configured to detect either a single body or multiple bodies in the camera stream. When one or more bodies are detected an array of body data is emitted to all listeners.

### Usage

To setup body detection instatiate a new object of the class 'Bodystream':
_Example_
    const bodies = new BodyStream (posenet, detectionType.singleBody, document.getElementById('video'), modelType.samplingRate)

Body-detection in /lib/bodydetection.js

Examples sketches are in /Sketches
