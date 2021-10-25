
function continuosly(fun) {
   fun()
   requestAnimationFrame(() => continuosly(fun))
}

class Queue {
   maxLength = 0
   items = []

   constructor (maxLength) {
      this.maxLength = maxLength
   }

   get length () {
      return this.items.length
   } 

   push (item) {
      this.items.push(item)
      if (this.items.length > this.maxLength)
         this.items.shift()
   }
}

export { continuosly, Queue }



