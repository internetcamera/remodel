import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import { task } from 'hardhat/config';
import { HardhatUserConfig } from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import 'hardhat-change-network';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.11',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhat: {
      accounts: {
        count: 100
      }
    },
    rinkeby: {
      chainId: 4,
      url: require('dotenv').config({ path: '.env.4' }).parsed.RPC_ENDPOINT
    },
    goerli: {
      chainId: 5,
      url: require('dotenv').config({ path: '.env.5' }).parsed.RPC_ENDPOINT
    }
  },
  namedAccounts: {
    deployer: 0
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5'
  },
  etherscan: {
    apiKey: require('dotenv').config({ path: '.env.4' }).parsed
      .ETHERSCAN_API_KEY as string
  }
};

export default config;
