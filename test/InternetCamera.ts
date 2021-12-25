import * as chai from 'chai';
import { BigNumber, Signer } from 'ethers';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import {
  InternetCameraCollection,
  InternetCameraKit,
  InternetCameraKit__factory,
  InternetCameraFilmERC20,
  InternetCameraRegistry,
  InternetCameraFilmERC20__factory,
  InternetCameraCollection__factory,
  InternetCameraFilmERC721,
  InternetCameraFilmERC721__factory
} from '../typechain';
chai.use(chaiAsPromised);
//@ts-ignore
import { ethers, getNamedAccounts } from 'hardhat';

describe('Internet Camera', function () {
  let accounts: Signer[] = [];
  let addresses: string[] = [];
  let registry: InternetCameraRegistry;

  let filmERC20Implementation: InternetCameraFilmERC20;
  let filmERC721Implementation: InternetCameraFilmERC721;
  let collectionImplementation: InternetCameraCollection;

  let deployments: Array<{
    film: InternetCameraFilmERC20 | InternetCameraFilmERC721;
    collection: InternetCameraCollection;
  }> = [];

  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
    addresses = await Promise.all(accounts.map(signer => signer.getAddress()));
    const Registry = await ethers.getContractFactory('InternetCameraRegistry');
    registry = (await Registry.deploy()) as InternetCameraRegistry;
    await registry.deployed();

    const FilmERC20 = await ethers.getContractFactory(
      'InternetCameraFilmERC20'
    );
    filmERC20Implementation =
      (await FilmERC20.deploy()) as InternetCameraFilmERC20;
    await filmERC20Implementation.deployed();

    const FilmERC721 = await ethers.getContractFactory(
      'InternetCameraFilmERC721'
    );
    filmERC721Implementation =
      (await FilmERC721.deploy()) as InternetCameraFilmERC721;
    await filmERC721Implementation.deployed();

    const Collection = await ethers.getContractFactory(
      'InternetCameraCollection'
    );
    collectionImplementation =
      (await Collection.deploy()) as InternetCameraCollection;
    await collectionImplementation.deployed();
  });

  it('should deploy and initialize', async function () {
    const { deployer } = await getNamedAccounts();
    await expect(await registry.owner()).to.equal(deployer);
  });

  it('should allow a custom kit deploy with erc20 film', async function () {
    // Deploy like a user would
    const InternetCameraKit = (await ethers.getContractFactory(
      'InternetCameraKit'
    )) as InternetCameraKit__factory;
    const contract = (await InternetCameraKit.deploy(
      'Test',
      'TEST',
      filmERC20Implementation.address,
      {
        mintable: false,
        premint: 100,
        maxSupply: 100,
        startTime: 0,
        endTime: 0,
        price: 0
      },
      collectionImplementation.address,
      registry.address
    )) as InternetCameraKit;
    const tx = await (await contract.deployed()).deployTransaction.wait();
    const deployed = tx.logs.filter(l => l.data == '0x');
    const film = InternetCameraFilmERC20__factory.connect(
      deployed[1].address,
      accounts[0]
    );
    const collection = InternetCameraCollection__factory.connect(
      deployed[2].address,
      accounts[0]
    );

    // Test the configuration
    await expect(await film.name()).to.equal('Test');
    await expect(await film.symbol()).to.equal('TEST');
    await expect((await film.config()).mintable).to.equal(false);
    await expect((await film.config()).premint).to.equal(100);
    await expect((await film.config()).maxSupply).to.equal(100);
    await expect((await film.config()).price).to.equal(0);
    await expect((await film.config()).startTime).to.equal(0);
    await expect((await film.config()).endTime).to.equal(0);

    // Test preminting
    const expectedSupply = BigNumber.from(100).mul(
      BigNumber.from(10).pow(await film.decimals())
    );
    await expect(await film.totalSupply()).to.equal(expectedSupply);
    await expect(await film.balanceOf(addresses[0])).to.equal(expectedSupply);

    // Test basic use
    await expect(film.use('IPFS_TEST_HASH')).to.eventually.be.fulfilled;
    await expect(await film.balanceOf(addresses[0])).to.equal(
      expectedSupply.sub(
        BigNumber.from(1).mul(BigNumber.from(10).pow(await film.decimals()))
      )
    );
    await expect(await collection.totalSupply()).to.equal(1);
    await expect(await collection.balanceOf(addresses[0])).to.equal(1);
    await expect(await collection.tokenURI(1)).to.equal(
      'ipfs://IPFS_TEST_HASH'
    );
  });

  it('should allow a custom kit deploy with erc721 film', async function () {
    // Deploy like a user would
    const InternetCameraKit = (await ethers.getContractFactory(
      'InternetCameraKit'
    )) as InternetCameraKit__factory;
    const contract = (await InternetCameraKit.deploy(
      'Test',
      'TEST',
      filmERC721Implementation.address,
      {
        mintable: false,
        premint: 1,
        maxSupply: 100,
        startTime: 0,
        endTime: 0,
        price: 0
      },
      collectionImplementation.address,
      registry.address
    )) as InternetCameraKit;
    const tx = await (await contract.deployed()).deployTransaction.wait();
    const deployed = tx.logs.filter(l => l.data == '0x');

    const film = InternetCameraFilmERC721__factory.connect(
      deployed[2].address,
      accounts[0]
    );
    const collection = InternetCameraCollection__factory.connect(
      deployed[3].address,
      accounts[0]
    );

    // Test the configuration
    await expect(await film.name()).to.equal('Test');
    await expect(await film.symbol()).to.equal('TEST');
    await expect((await film.config()).mintable).to.equal(false);
    await expect((await film.config()).premint).to.equal(1);
    await expect((await film.config()).maxSupply).to.equal(100);
    await expect((await film.config()).price).to.equal(0);
    await expect((await film.config()).startTime).to.equal(0);
    await expect((await film.config()).endTime).to.equal(0);

    // Test preminting
    await expect(await film.totalSupply()).to.equal(1);
    await expect(await film.balanceOf(addresses[0])).to.equal(1);
    await expect(await film.ownerOf(1)).to.equal(addresses[0]);

    // Test basic use
    await expect(film.use(1, 'IPFS_TEST_HASH')).to.eventually.be.fulfilled;
    await expect(await film.balanceOf(addresses[0])).to.equal(0);
    await expect(await collection.totalSupply()).to.equal(1);
    await expect(await collection.balanceOf(addresses[0])).to.equal(1);
    await expect(await collection.ownerOf(1)).to.equal(addresses[0]);
    await expect(await collection.tokenURI(1)).to.equal(
      'ipfs://IPFS_TEST_HASH'
    );
  });
});
