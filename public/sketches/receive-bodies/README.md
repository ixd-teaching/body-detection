## Receive body data remotely

### Description
This sketch demonstrates how to receive body data send from another device or browser tab. We use Clint's remote class to receive data

### Usage 
Via the remote class' onData event we listen to any incoming data and we add the data to a newly instantiated empty 'Bodies' class. Every time we receive new body data we instantiate a 'Body' class with the data by calling 'createBodyFromObject(bodyObject)'. We add device id to body' id to be able to uniquely identify each body in case we are receiving data from more than one device or tab. Finally, we update 'bodies' with the new data. If a body with same id has previously been detected update (replace) the body with the new body data and if it hasn't been detected before update will add the new body to the list of bodies. 

~~~javascript
  const bodies = new Bodies([]) // create empty list of bodies

  remote.onData = (bodyObject) => {
    // create a body from received bodyObject
    const body = createBodyFromObject(bodyObject)

    // we are adding device id to body' id to uniquely identify body if receiving data from more than one device
    body.id = body.id + ':' + bodyObject.from

    // update list of bodies with new body data
    bodies.updateBody(body)
  }
~~~

We also output each received body's id and data (position, speed, confidenceScore) of each body part to the console which (by a bit of magic) will be shown in the 'log' div on the page. 

