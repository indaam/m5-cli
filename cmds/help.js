const menus = {
  main: `
    m5 <options>

    create html <name>  ................................ Create HTML project
    create react-js <name>  ............................ Create react js project (On progress)
    create react-native <name>  ........................ Create react Native project (On progress)
    create comp <comp_type> <comp_name> ................ Create react component
    version ............................................ show package version
    help ............................................... show help menu for a command`,
}

module.exports = (args) => {
  console.log(menus.main)
}
