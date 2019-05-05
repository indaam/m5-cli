const menus = {
  main: `
    m5 <options>

    create html <name>  ................................ Create HTML project
    create react-js <name>  ............................ Create react js project (On progress)
    create react-native <name>  ........................ Create react Native project (On progress)
    create comp <comp_type> <comp_name> ................ Create react component
    add <plugins_name> <key>?(optional) ................ Add react native plugins
    demo ............................................... Create react native demo
    install ............................................ Install all pluns from app.json
    fonts <font_name>................................... Auto install & create font
    version ............................................ Show package version
    help ............................................... Show help menu for a command`,
}

module.exports = (args) => {
  console.log(menus.main)
}
