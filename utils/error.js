module.exports = (message, exit) => {
    console.log('\x1b[31m', '!! ERROR !!', '\x1b[0m')
    console.log('\x1b[31m', message, '\x1b[0m')
    exit && process.exit(1)
}
