
function continuosly(fun) {
   fun()
   requestAnimationFrame(() => continuosly(fun))
}

export { continuosly }
