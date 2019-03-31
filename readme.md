# m5 cli
A CLI for create everything.

## Install
Choose One
`yarn add global m5-cli` or  
`yarn add -D m5-cli && cd node_modules/m5-cli && npm link` or  
`npm install m5-cli -g` or  
`npm install m5-cli --save-dev && cd node_modules/m5-cli && npm link` or
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

### Command Example
Create atom ButtonX component  
`m5 create comp atom ButtonX` shotrcut => `m5 create c a ButtonX`

Create molecule MyMole component  
`m5 create comp molecule MyMole` shotrcut => `m5 create c m MyMole`

Create organism MyOrg component  
`m5 create comp organism MyOrg` shotrcut => `m5 create c o MyOrg`

Create container MyCont component  
`m5 create comp container MyCont` shotrcut => `m5 create c c MyCont`
