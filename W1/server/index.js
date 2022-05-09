const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const secp = require('@noble/secp256k1');
const SHA256 = require('js-sha256');
const numBalances = 5;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

let getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let generatePrivateKeys = (amount) => {
  let privateKeyArray = [];
  for (i = 0; i < amount; i++) {
    let privateKeyi = Buffer.from(secp.utils.randomPrivateKey()).toString('hex');
    privateKeyArray.push(privateKeyi);
  };
  return privateKeyArray;
};

let generateBalances = (privateKeyArray) => {
  let balances = {};
  for (i = 0; i < privateKeyArray.length; i++) {
      let publicKeyi = Buffer.from(secp.getPublicKey(privateKeyArray[i])).toString('hex');
      publicKeyi = "0x" + publicKeyi.slice(publicKeyi.length - 40);
      balances[publicKeyi] = getRandomInt(0, 100);
  };
  return balances;
};

const privateKeys = generatePrivateKeys(numBalances);
const balances = generateBalances(privateKeys);

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, signature} = req.body;
  const msgHash = SHA256(JSON.stringify({sender, recipient, amount})).toString();
  const recoveredPublicKey = secp.recoverPublicKey(msgHash, signature, 1);
  const isVerified = secp.verify(signature, msgHash, recoveredPublicKey);
  if (isVerified) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
  }
  res.send({ balance: balances[sender] }); 
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log('Available Accounts')
  console.log('================')
  let ctr = 0;
  for (const key in balances) {
    console.log(`(${ctr}) ${key} (${balances[key]} ETH)`);
    ctr++;
  };
  console.log('\nPrivate Keys')
  console.log('================')
  ctr = 0;
  for (let i = 0; i < privateKeys.length; i++) {
    console.log(`(${ctr}) ${privateKeys[i]}`);
    ctr++;
  };
});
