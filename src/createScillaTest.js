module.exports = () =>
    `const {bytes} = require('@zilliqa-js/util');
const setup = require("./setup");
//TODO:  import under test scilla artifacts! 

const {admin, dev, user_1, user_2, user_3} = require("./accounts");

const privateKey = admin.privateKey;
const contract_owner = admin.address;
const dev_address = dev.address;
const api = 'http://localhost:5555';
const version = bytes.pack(222, 1);
const net = 'Local';


//TODO: please enter test description 
describe('test smart contract', () => {

    beforeAll(async () => {
        await setup().start();
    });
    
    afterAll(async () => {
        await setup().stop();
    });
    
    //TODO: please enter test description 
    it("should ......", async() => {
    
    });
});
`;