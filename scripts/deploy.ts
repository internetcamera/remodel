import fs from 'fs-extra';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import {
  InternetCameraCollection__factory,
  InternetCameraFilmERC20__factory,
  InternetCameraFilmERC721__factory,
  InternetCameraRegistry__factory
} from '../typechain';
import hre from 'hardhat';
import 'hardhat-change-network';

async function start() {
  const args = require('minimist')(process.argv.slice(2));

  if (!args.chainId) {
    throw new Error('--chainId chain ID is required');
  }
  const chainId = args.chainId;

  if (chainId == '4') hre.changeNetwork('rinkeby');
  else if (chainId == '5') hre.changeNetwork('goerli');

  const path = `${process.cwd()}/.env.${chainId}`;
  const env = require('dotenv').config({ path }).parsed;
  const provider = new JsonRpcProvider(env.RPC_ENDPOINT);
  const wallet = new Wallet(`0x${env.PRIVATE_KEY}`, provider);
  const addressesPath = `${process.cwd()}/addresses/${chainId}.json`;
  const addressBook = JSON.parse(
    await fs.readFileSync(addressesPath).toString()
  );

  if (!addressBook.registry) {
    console.log('Deploying InternetCameraRegistry...');
    const deployTx = await new InternetCameraRegistry__factory(wallet).deploy();
    console.log('Deploy TX: ', deployTx.deployTransaction.hash);
    await deployTx.deployed();
    addressBook.registry = deployTx.address;
    await fs.writeFile(addressesPath, JSON.stringify(addressBook, null, 2));
    console.log('InternetCameraRegistry deployed at ', deployTx.address);
    await deployTx.deployTransaction.wait(5);
    await hre.run('verify:verify', { address: addressBook.registry });
  }

  if (!addressBook.filmERC20) {
    console.log('Deploying InternetCameraFilmERC20...');
    const deployTx = await new InternetCameraFilmERC20__factory(
      wallet
    ).deploy();
    console.log('Deploy TX: ', deployTx.deployTransaction.hash);
    await deployTx.deployed();
    addressBook.filmERC20 = deployTx.address;
    await fs.writeFile(addressesPath, JSON.stringify(addressBook, null, 2));
    console.log('InternetCameraFilmERC20 deployed at ', deployTx.address);
    await deployTx.deployTransaction.wait(5);
    await hre.run('verify:verify', { address: addressBook.filmERC20 });
  }

  if (!addressBook.filmERC721) {
    console.log('Deploying InternetCameraFilmERC721...');
    const deployTx = await new InternetCameraFilmERC721__factory(
      wallet
    ).deploy();
    console.log('Deploy TX: ', deployTx.deployTransaction.hash);
    await deployTx.deployed();
    addressBook.filmERC721 = deployTx.address;
    await fs.writeFile(addressesPath, JSON.stringify(addressBook, null, 2));
    console.log('InternetCameraFilmERC721 deployed at ', deployTx.address);
    await deployTx.deployTransaction.wait(5);
    await hre.run('verify:verify', { address: addressBook.filmERC721 });
  }

  if (!addressBook.collection) {
    console.log('Deploying InternetCameraCollection...');
    const deployTx = await new InternetCameraCollection__factory(
      wallet
    ).deploy();
    console.log('Deploy TX: ', deployTx.deployTransaction.hash);
    await deployTx.deployed();
    addressBook.collection = deployTx.address;
    await fs.writeFile(addressesPath, JSON.stringify(addressBook, null, 2));
    console.log('InternetCameraCollection deployed at ', deployTx.address);
    await deployTx.deployTransaction.wait(5);
  }
  await hre.run('verify:verify', { address: addressBook.collection });

  console.log('Deployed!');
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
