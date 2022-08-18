// 先编译 获取二进制对象
import fs from "fs";
import solc from "solc";

const source = fs.readFileSync("Incrementer.sol", 'utf-8');
const input = {
    language: "Solidity",
    sources: {
        "Incrementer.sol": {
            content: source,
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

const contractFile = tempFile.contracts["Incrementer.sol"]['Incrementer'];

export { contractFile };