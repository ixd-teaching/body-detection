class SerialConnection {
   connected = false
   port
   writer

   constructor() {
      // check browser supports serial ports
      if (!'serial' in navigator)
         throw 'Your browser does not support serial ports'
   }

   async connect() {
      try {
         // prompt for which port to use
         this.port = await navigator.serial.requestPort()
         // open the port
         await this.port.open({ baudRate: 115200 })
         // pipe a writer to the port
         const textEncoder = new TextEncoderStream()
         const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable)
         this.writer = textEncoder.writable.getWriter()
         this.connected = true
      } catch (err) {
         console.error(err)
         alert('Could not find/connect to port')
      }
   }

   async disconnect() {
      if (connected) {
         try {
            await this.writer.releaseLock()
         } catch (err) {
            console.error(err)
         }
         try {
            await this.writer.close()
         } catch (err) {
            console.error(err)
         }
         try {
            await this.port.close()
         } catch (err) {
            console.error(err)
         }
         connected = false
      }
   }

   async toggle() {
      this.connected ? await this.disconnect() : await this.connect()
   }

   async write(s) {
      if (this.connected) {
         await this.writer.write(s)
         console.log(s)
      }
   }
}

export { SerialConnection }