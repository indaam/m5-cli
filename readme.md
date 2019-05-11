# m5 cli
A CLI for create everything.

## Install
Choose One  
`npm install -g m5-cli` (recommended) or  
`npm install m5-cli --save-dev && cd node_modules/m5-cli && npm link` or  
`yarn add -D m5-cli && cd node_modules/m5-cli && npm link` or  
`git clone https://github.com/indaam/m5-cli.git && cd m5-cli && npm install && npm link`  

## Create Project
#### Create html Project
Command : `m5 create html <projectName>`  
Output : Automatically create skeleton HTML project, include gulp, scss, es6, etc.

#### Create react Project
Command : `m5 create react-js <projectName>`  
Output : Automatically create skeleton React js project, include base config, plugins, etc.

#### Create react Native Project
Command : `m5 create react-native <projectName>`  
Output : Automatically create skeleton React Native project, include base config, plugins, etc.


## Create react Component
Command : `m5 create comp <component_type> <component_name>`  
Output : Generate(create) component base on kesepakatan  
Component Type : [atom|molecule|organisms|container]

### Command Example
Create atom MyButton component  
`m5 create comp atom MyButton` shotrcut => `m5 create c a MyButton`

Create molecule MyMole component  
`m5 create comp molecule MyMole` shotrcut => `m5 create c m MyMole`

Create organism MyOrg component  
`m5 create comp organism MyOrg` shotrcut => `m5 create c o MyOrg`

Create container MyCont component  
`m5 create comp container MyCont` shotrcut => `m5 create c c MyCont`

### How it works?
When you first create component, it will create m5 folder. Then on m5 folder, you can see BaseClass, BaseFunction, etc. Basicly ya, just copy then rename component name, You can update that.  
Also if need to change target component, you can edit m5.config, then generate new component

## New Install react native plugins  
This task for automaticly install react-native plugins, like google maps, camera, etc.  
Before use, u need to install
* cocopods  
* xcode  
* watchman  
* brew  
* yarn  

#### Command Example
`m5 add react-native-maps` or  
`m5 add react-native-maps@0.24.2` or 
`m5 add react-native-maps@0.24.2 key=___YOUR_GOOGLE_MAP_KEY___`

#### Output
* Automatic add to package.json
* Automatic linking
* Automatic setup
* Add sample

#### Run Demo  
After you type `m5 add react-native-maps`, you can run the demo  
`m5 demo && react-native run-ios`

### Task Install
Basicly this task concept same like, `npm install` or `yarn install`
You can define you plugins on app.jspn, like this  
```
  "displayName": "yourAppName",
  "nativePlugins": {
    "react-native-gesture-handler": "1.1.0",
    "react-native-maps": {
        "version" : "0.24.2",
        "key" : "____YOUR_KEY____",
    },
    "react-native-camera": "2.6.0",
    "react-native-contacts": "4.0.1"
  }
```  
And then type `m5 install` on terminal,  
also dont forget to type `m5 demo` for setup demo  
To run, you can use `react-native run-ios` or `yarn ios` or `yarn i`

### Task Fonts
if your type `m5 fonts opens sans`, it will automaticly download font from google font, then setup on your RN project, also dont fotget to type `m5 demo` for see the demo


### !IMPORTANT
Maybe your run many RN project, so you need to clean other prject before run new project.
We create shorcut for clean, like this
+ `yarn clean-watch` => clean javascript chache & delete all watchman
+ `yarn clean-ios` => clean all Pods, build & reinstall pod #Becarefull with pod version
+ `yarn clean-android` => gradlew clean & remove build
+ `yarn clean-package` => remove node module & reinstall node modules

### Plugins list todos
+ react-native-maps
    - Android [DONE]
    - iOs [DONE]
+ react-native-gesture-handler
    - Android [DONE]
    - iOs [DONE]
+ react-native-camera
    - Android [DONE]
    - iOs [DONE] // without test
+ react-native-contacts
    - Android [DONE]
    - iOs [DONE]
+ react-native-device-info
    - Android [DONE]
    - iOs [DONE]
+ react-native-svg
    - Android [DONE]
    - iOs [DONE]
+ react-native-firebase
    - Android [PENDING]
    - iOs [PENDING]
+ react-native-fbsdk
    - Android [PENDING] 
    - iOs [DONE]
+ react-native-google-signin
    - Android [PENDING]
    - iOs [PENDING]
+ react-native-fs
    - Android [PENDING]
    - iOs [PENDING]
+ react-native-share
    - Android [PENDING]
    - iOs [PENDING]
+ lottie-react-native
    - Android [DONE]
    - iOs [DONE]// Need to open xcode project


## Create React Native Project
By default, if want to create react native project, you type `react-native init yourAppName` and then maybe you setup pods for ios or create shotcut scripts.  
Next steps, maybe you will install react native plugins, like `react-native-camera` or `react-native-contacts`. But sometime install plugins is anoying, solved on ios, but not on android.  
So, for simple solution we create cli for setup react native plugins.


#### This is example if will install 3 plugins and 2 google font
+ 3 plugins
    - `react-native-device-info`
    - `react-native-maps`
    - `react-native-contacts`
+ 2 Fonts
    - `Open Sans`
    - `Oswald`

##### Steps  
+ `npm install -g m5-cli`
+ `cd ~/Documents/`
+ `m5 create react-native yourAppName`
+ `cd yourAppName && ls`
+ `m5 add react-native-device-info`
+ `m5 demo`
+ `react-native run-android` or `react-native run-ios`  
+ if error, try to clean watch && chache `yarn clean-watch`
+ and try again `react-native run-android` or `react-native run-ios` 
+ if success, next
+ `m5 add react-native-contacts`
+ `m5 add react-native-maps key=__YOUR_MAP__API__KEY__`
+ `m5 demo`
+ after add, you need to re run
+ `react-native run-android` or `react-native run-ios` 
+ `m5 fonts Open Sans`
+ `m5 fonts Oswald`
+ `m5 demo`
+ `react-native run-android` or `react-native run-ios` 

Task `m5 demo` is automaticly create demo from plugins


## Todos

* Command validation
* Option command
* Create dinamic Component
* Maping after create component
* Create Log
* When internet error
* checking tools & version
* create task remove plugins
