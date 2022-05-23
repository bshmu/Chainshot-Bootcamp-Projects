const express = require('express');
const app = express();
const cors = require('cors');
const port = 3002;
const ethers = require('ethers');
const path = require('path');
const { ifError } = require('assert');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_MAINNET_URL);
app.use(cors());
app.use(express.json());

app.get('/get-address-txns/:address/:blocksToSearch', async (req, res) => {
    const {address, blocksToSearch} = req.params;
    const txnHistory = [];
    const blockNumber = await provider.getBlockNumber();
    for (let i = blockNumber - blocksToSearch; i <= blockNumber; i++) {
        console.log("block number:" + i);
        const block = await provider.getBlockWithTransactions(i);
        const blockTransactions = block.transactions;
        const dateObj = new Date(block.timestamp * 1000);
        const date = dateObj.toLocaleString();
        let txnRecord = {};
        for (let j = 0; j < blockTransactions.length; j++){
            if (blockTransactions[j].from == address || blockTransactions[j].to == address) {
                const gasFee = blockTransactions[j].gasPrice * blockTransactions[j].gasLimit;
                let txnURL = "https://etherscan.io/tx/" + blockTransactions[j].hash;
                txnRecord['Date'] = date;
                txnRecord['Block Number'] = i.toString();
                if (blockTransactions[j].from == address) {
                    txnRecord['Txn Type'] = 'Sent';
                    txnRecord['Counterparty'] = blockTransactions[j].to;
                };
                if (blockTransactions[j].to == address) {
                    txnRecord['Txn Type'] = 'Received';
                    txnRecord['Counterparty'] = blockTransactions[j].from;
                };
                txnRecord['Amount'] = ethers.utils.formatEther(ethers.BigNumber.from(parseInt(blockTransactions[j].value._hex, 16).toString()));
                txnRecord['Gas Fee'] = ethers.utils.formatEther(ethers.BigNumber.from(parseInt(gasFee.toString(16))));
                txnRecord['Etherscan Txn Record'] = txnURL;
                txnHistory.push(txnRecord);
                console.log(txnRecord);
            };
        };
    };
    res.send({ txnHistory });
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});