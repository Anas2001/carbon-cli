# carbon-cli

Zilliqa bockchain CLI for bootstrap a project with example token contract

## Setup

### system requirements
    
    1- Docker 
    2- nodejs and npm 

Please make sure you have installed the nodejs with npm. First you need to install the `carbon cli` with
command `npm i -g carbon-zil`

to create new zilliqa project with smart contracts:

    1- create project folder 
    2- inside project folder run `carbon init -g -i`

## How to generate scilla artifacts as js files?

### ToDo: compile contracts with transitions parameters of AST types

Please make sure your run the compile command from root folder of project. To compile the contract (convert smart
contract to js as artifacts) you need only to run `carbon compile`
the out of artifacts will be generated under `zilliqa/artifacts` folder. You can use the artifacts of smart contracts to deploy
or call transitions of smart contract from nodejs.

## Testing:

Carbon uses jestJS testing framework to provide you solid framework to write your JavaScript tests.

### How to use the test?

    1- you need to create contract under "zilliqa/contracts"
    2- run "carbon compile" command to compile the scilla to js client script 
    3- run "carbon scilla-test" and enter the name of your test

You will find the new generated test script under test. You need to be sure that you run ceres server with the
command `carbon ceres` before you start the command `carbon test` for running all tests under "zilliqa/test". To close
the ceres with `ctr + c`.


## ToDos:
    
    1- deploy contracts to target network
    2- compile contracts with transitions parameters of AST types