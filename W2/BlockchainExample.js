const wp = require('whirlpool-js')

class Block {
    constructor(index, timestamp, data) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = "";
        this.hash = this.computeHash();
        this.nonce = 0;
        console.log(this.prevHash);
    }
    
    computeHash() {
        let encryptionArgument = String(this.index) + 
                                 this.prevHash + 
                                 this.timestamp + 
                                 JSON.stringify(this.data) + 
                                 String(this.nonce);
        return wp.encSync(encryptionArgument, 'hex');
    }

    proofOfWork(difficulty) {
        while(this.hash.substring(0, difficulty) != Array(difficulty+1).join("0")) {
            this.nonce++;
            this.hash = this.computeHash();
        }
    }
}

class Blockchain {
    constructor() {
        this.blockchain = [this.genesisBlock()];
        this.difficulty = 3;
    }

    genesisBlock() {
        return new Block(0, "2022-05-08", "This is the first block.")   
    }

    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    addBlock(block) {
        block.prevHash = this.getLastBlock().hash;
        block.hash = block.computeHash();
        block.proofOfWork(this.difficulty);
        if (this.ensureValidity(block)) {
            this.blockchain.push(block);
        };
    }

    ensureValidity(block) {
        let prevBlock = this.getLastBlock();
        if (block.prevHash != prevBlock.hash) {
            return false;
        }
        return true;
    }

}

let exampleCoin = new Blockchain();
let today = new Date();
today = String(today.getFullYear()) + '-' + String(today.getMonth()+1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
console.log("Mining in progress...");
exampleCoin.addBlock(new Block(1, today, {sender: "Bob", recipient: "Ben", quantity: 50}));
exampleCoin.addBlock(new Block(2, today, {sender: "John", recipient: "Alex", quantity: 20}));
exampleCoin.addBlock(new Block(3, today, {sender: "Robert", recipient: "Jacob", quantity: 30}));
console.log(JSON.stringify(exampleCoin, null, 4));