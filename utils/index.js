const delay = (delay = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, delay)
  })
}

module.exports = {
  delay
}