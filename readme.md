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
This task for automaticly install react-native plugins, like google maps, camera, etc

#### Command Example
`m5 add react-native-maps` or  
`m5 add react-native-maps@0.24.2` or    
`m5 add react-native-maps@0.24.2 key="___YOUR_GOOGLE_MAP_KEY___"`

#### Output
* Automatic add to package.json
* Automatic linking
* Automatic setup
* Add sample

#### Run Demo  
After you type `m5 add react-native-maps`, you can run the demo  
`m5 demo`

### Plugins list todos
+ react-native-maps
    - Android [DONE]
    - iOs [DONE]
+ react-native-gesture-handler
    - Android [DONE]
    - iOs [DONE]
+ react-native-camera
    - Android [DONE]
    - iOs [DONE](without test)
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
    - iOs [PENDING]
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
    - Android [PENDING]
    - iOs [PENDING]
+ lottie-react-info
    - Android [PENDING]
    - iOs [PENDING]

## Todos

* Command validation
* Option command
* Create dinamic Component
* Maping after create component
* Create Log
* When internet error
* checking tools & version
