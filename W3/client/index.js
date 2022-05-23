import "./index.scss";
import axios from 'axios';
const server = "http://localhost:3002";
const ethers = require('ethers');

document.getElementById("get-txn-history").addEventListener('click', async () => {
    const address = document.getElementById("public-address").value;
    const blocksToSearch = document.getElementById("blocks-to-search").value;
    const response = await axios.get(`${server}/get-address-txns/${address}/${blocksToSearch}`);
    const txnHistory = response.data.txnHistory;
    let html = "<table class='table'>" +
               "<tr>" +
                "<th>Date</th>" +
                "<th>Block Number</th>" +
                "<th>Txn Type</th>" +
                "<th>Counterparty</th>" +
                "<th>Amount (ETH)</th>" +
                "<th>Gas Fee (ETH)</th>" +
                "<th>Etherscan Txn Record</th>" +
                "</tr>";
    for (let i = 0; i < txnHistory.length; i++) {
        html += "<tr>" + "<td>" + txnHistory[i]['Date'] + "</td>"
        + "<td>" + txnHistory[i]['Block Number'] + "</td>"
        + "<td>" + txnHistory[i]['Txn Type'] + "</td>"
        + "<td>" + txnHistory[i]['Counterparty'] + "</td>"
        + "<td>" + txnHistory[i]['Amount'] + "</td>"
        + "<td>" + txnHistory[i]['Gas Fee'] + "</td>"
        + "<td>" + "<a href='" + txnHistory[i]['Etherscan Txn Record'] + "'>" 
        + txnHistory[i]['Etherscan Txn Record'] + "</a>" + "</td>" + "</tr>";
    };
    html += "</table>";
    document.getElementById("txn-history").innerHTML = html;
});