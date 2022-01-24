import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import myEpicNft from "./utils/MyEpicNFT.json";

import { ethers } from "ethers";

const TWITTER_HANDLE = "mklilley";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xD2CAaAb5eF6a9D0aC505c9772E965f9052dcACC8";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [rinkeby, setRinkeby] = useState(false);
  const [maxNFT, setMaxNFT] = useState(0);
  const [mintedNFT, setMintedNFT] = useState(0);
  const [isMining, setIsMining] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      setRinkeby(false);
    } else {
      setRinkeby(true);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
      fetchNFTMintingInfo();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
      fetchNFTMintingInfo();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNFTMintingInfo = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("collecting NFT minting info");
        let maxNFT = await connectedContract.getMaxNFTsMinted();
        let mintedNFT = await connectedContract.getTotalNFTsMintedSoFar();

        setMaxNFT(maxNFT.toNumber());
        setMintedNFT(mintedNFT.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        setIsMining(true);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setIsMining(false);

        fetchNFTMintingInfo();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setIsMining(false);
      console.log(error);
      if (error.message) {
        alert(error.message);
      } else if (error.error) {
        alert(error.error.message);
      }
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      disabled={!rinkeby}
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  /*
   * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
   */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My WordSquare NFTs</p>
          <p className="sub-text">Simple, on-chain NFTs.</p>

          <p className="sub-text">
            Check out the collection on{" "}
            <a
              target="_blank"
              href="https://testnets.opensea.io/collection/squarenft-waknandpbt"
            >
              OpenSea
            </a>{" "}
            (testnet)
          </p>

          {maxNFT !== 0 && (
            <p className="sub-text">
              {mintedNFT} of {maxNFT} NFTs minted.
            </p>
          )}
          {maxNFT === 0 && maxNFT === 0 && (
            <div className="sub-text">
              <p className="sub-text inline">Fetching minting stats </p>
              <div className="lds-ripple ">
                <div></div>
                <div></div>
              </div>
            </div>
          )}
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            //
            <button
              disabled={!rinkeby || isMining || mintedNFT === maxNFT}
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              <p> Mint NFT </p>
            </button>
          )}
          {isMining && (
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
