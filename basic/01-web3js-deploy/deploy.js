import Web3 from "web3";
import solc from "solc";
import fs from "fs";
// ES6module  dotenv的使用
import "dotenv/config.js";
// deploy script
const private_key = process.env.PRIVATE_KEY;
const rpc_link = process.env.ALCHEMY_LINK;

// 1. 读取sql文件并编译
const file = fs.readFileSync('Incrementer.sol', 'utf-8');
const input = {
    language: "Solidity",
    sources: {
        "Incrementer.sol": {
            content: file,
        },
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));


// 获取二进制对象
const contractFile = tempFile.contracts["Incrementer.sol"]["Incrementer"];

// 获取abi
const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

// 构造web3对象
const web3 = new Web3(rpc_link);

// 根据私钥获取账户地址
const account = web3.eth.accounts.privateKeyToAccount(private_key);
const account_from = {
    privateKey: private_key,
    accountAddress: account.address
};

// 根据abi构造合约实例
const deployContract = new web3.eth.Contract(abi);

// deploy -> create TX
const deployTx = deployContract.deploy({
    data: bytecode,
    arguments: [5]
});

// 使用私钥对交易进行签名
const deployTransaction = await web3.eth.accounts.signTransaction(
    {
        data: deployTx.encodeABI(),
        gas: 8000000,
    },
    account_from.privateKey
);

// 部署合约
const deployReceipt = await web3.eth.sendSignedTransaction(
    deployTransaction.rawTransaction
);
console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);
