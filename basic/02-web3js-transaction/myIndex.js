import { contractFile } from "./myCompile.js";

import "dotenv/config";
import Web3 from "web3";

const privateKey = process.env.PRIVATE_KEY;
const rpc_link = process.env.ALCHEMY_LINK;
// alchemy wss地址
const listen_wss = process.env.ALCHEMY_WSS;

const providerRpc = {
    dev: rpc_link
}

const web3 = new Web3(providerRpc.dev);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const account_from = {
    privateKey: privateKey,
    accountAddress: account.address,
};

const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

/**
 * 部署合约的步骤
 * 1. 构造合约实例
 * 2. 创建合约交易（获取交易tx）
 * 3. 使用私钥对交易签名
 * 4. 发送签名后的交易到网络，同时返回交易回执
 */

// 构造合约实例
const deploymentContract = new web3.eth.Contract(abi);

const deployTx = deploymentContract.deploy({
    data: bytecode,
    arguments: [3]
})

const deployTransaction = await web3.eth.accounts.signTransaction(
    {
        data: deployTx.encodeABI(),
        gas: 8000000
    },
    account_from.privateKey
);

// const deployReceipt = await web3.eth.sendSignedTransaction(
//     deployTransaction.rawTransaction
// );
// console.log(`Contract deploy at address: ${deployReceipt.contractAddress}`);

//  我们也可以直接加载一个已经上链的合约实例, 这样就可以直接对合约进行操作, 避免了中间的部署过程
let address = '0xa6D504192F102cD9c7a026bf47b13c3BE050DBAe';
let incrementer = new web3.eth.Contract(abi, address);

// 调用只读模块
let number = await incrementer.methods.getNumber().call();
console.log(`此合约的number state variable: ${number}`);

// 先构造交易，即编码合约接口及相应的传入参数
let increamentTx = incrementer.methods.increment(3);
let increamentTransaction = await web3.eth.accounts.signTransaction(
    {
        to: address,
        data: increamentTx.encodeABI(),
        gas: 8000000,
    },
    account_from.privateKey
)


// 通过websocket监听合约
const web3Socket = new Web3(
    new Web3.providers.WebsocketProvider(listen_wss)
);
incrementer = new web3Socket.eth.Contract(abi, address);

// listen to  Increment event only once
incrementer.once("Increment", (error, event) => {
    console.log(event);
    console.log("I am a onetime event listner, I am going to die now");
});

const incrementReceipt = await web3.eth.sendSignedTransaction(
    increamentTransaction.rawTransaction
);

// 持续性监听合约事件
// incrementer.events.Increment(() => {
//     console.log("I am a longlive event listner, I get a event now");
// });

