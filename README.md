# carbon-cli

Zilliqa bockchain CLI for bootstrap a project with example token contract

## Setup

Please make sure you have installed the nodejs with npm. First you need to install the `carbon cli` with
command `npm i -g carbon-zil`

to create new zilliqa project with smart contracts:

    1- create project folder 
    2- inside project folder run `carbon init && cd zilliqa && npm install`
    3- go back to root folder cd ..

## How to generate scilla artifacts as js files?

Please make sure your run the compile command from root folder of project. To compile the contract (convert smart
contract to js as artifacts) you need only to run `carbon compile`
the out of artifacts will be generated under `artifacts` folder. You can use the artifacts of smart contracts to deploy
or call transitions of smart contract from nodejs.