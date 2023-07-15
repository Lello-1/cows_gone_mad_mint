'use client'

import "dotenv/config";
import React, { useEffect, useState } from "react";
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import { ethers, BrowserProvider, Contract } from "ethers";
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";
import { serializeError } from 'eth-rpc-errors'
import * as s from "./styles/globalStyles";
import Header from "../components/Header";
import MintInput from "../components/Mint_Input";
import localFont from "next/font/local";

const screebie = localFont({
  src: './fonts/screebie.ttf',
  weight: '700',
  display: 'swap'
});

// const providerOptions = {
//   binancechainwallet: {
//     package: true
//   },
//   coinbasewallet: {
//     package: CoinbaseWalletSDK,
//     options: {
//       appName: 'Polygon Prototype Contract',
//       alchemyId: {
//         3: `https://polygon-mumbai.g.alchemy.com/v2/cZi4QJUlHpBBa02zsxzly6SSU0e7uc8y`
//       }
//     }
//   }
// }

const MAINNET_RPC_URL = 'https://polygon-mumbai.g.alchemy.com/v2/cZi4QJUlHpBBa02zsxzly6SSU0e7uc8y';
const injected = injectedModule();

const onboard = Onboard({
  theme: 'dark',
  disableFontDownload: true,
  wallets: [injected],
  chains: [
    {
      id: '0x13881',
      token: 'MATIC',
      label: 'Polygon Testnet',
      rpcUrl: MAINNET_RPC_URL
    }
  ],
  appMetadata: {
    name: 'Cows Gone Mad',
    icon: '<svg>App Icon</svg>',
    description: 'Disrupting the medical industry.'
  }
});

export default function Home() {
  const [blockchain, setBlockchain] = useState({
    account: "",
    contract: null,
    default_contract: null
  });
  const [data, setData] = useState({
    totalMinted: 0,
    cost: 0
  });
  const [walletError, setWalletError] = useState('');
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click MINT to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const[ABI, setABI] = useState({});
  const [CONFIG, SET_CONFIG] = useState({});

  const RPC_connection = async (abi, config) => {
    const provider = new ethers.JsonRpcProvider(MAINNET_RPC_URL);

    const contract = new Contract(
      config.CONTRACT_ADDRESS,
      abi,
      provider
    );

    // Get mint cost
    const cost = await contract.getPrice();
    const totalMinted = await contract.totalSupply();

    blockchain.default_contract = contract;
    setData({
      cost,
      totalMinted
    });
    
  }
  
  // CONNECT WALLET
  const connectWallet = async () => {
    try {
      const wallets = await onboard.connectWallet();

      if (wallets[0]) {
        const provider = new BrowserProvider(wallets[0].provider, 'any');
        const signer = await provider.getSigner();
  
        // Request account
        const accounts = await wallets[0].provider.request({
          method: "eth_requestAccounts",
        });
        // Request Chain network
        const networkId = await wallets[0].provider.request({
          method: "net_version",
        });

        // Check networkId
        if (networkId == CONFIG.NETWORK.ID) {
  
          const contract = new Contract(
            CONFIG.CONTRACT_ADDRESS,
            ABI,
            signer
          );
          blockchain.contract = contract;
          blockchain.account = accounts[0];
  
          // Set our NFT minted total
          const totalMinted = await blockchain.contract.totalSupply();
          data.totalMinted = Number(totalMinted);
          
          setProvider(provider);
          setSigner(signer);

          // // Add listeners
          const wallets_state = onboard.state.select('wallets');
          const { unsubscribe } = wallets_state.subscribe(async (wallets) => {
            const { CHAINID } = CONFIG.NETWORK;
            
            if (wallets.length > 0) {
              const { id } = wallets[0].chains[0];

              if (id == CHAINID) {
                const newProvider = new BrowserProvider(wallets[0].provider, 'any');
                const newSigner = await newProvider.getSigner();
    
                blockchain.account = wallets[0].accounts[0].address;
                blockchain.contract = new Contract(
                  CONFIG.CONTRACT_ADDRESS,
                  ABI,
                  newSigner
                )
                setProvider(provider);
                setSigner(newSigner);
              } else {

                const [primaryWallet] = onboard.state.get().wallets
                await onboard.disconnectWallet({ label: primaryWallet.label })

                setFeedback(`Please Connect ${wallets[0].label} to the ${CONFIG.NETWORK.NAME} Network`);
              }
            }

          });

        } else {
          setWalletError(`Please Connect to the ${CONFIG.NETWORK.NAME} Network`);
        }

      }
    } catch (error) {
      setWalletError(CONFIG.WALLET_ERROR);
      console.log('Connect Wallet Error - ', serializeError(error));
    }
  }

  // NFT MINT
  const claimNFTs = async () => {
    const paused = await blockchain.contract.paused();

    if (paused) {
      setFeedback("The sale is not open yet.");
    } else {
      const isWhitelisted = await blockchain.contract
        .isWhitelisted(blockchain.account);
      const isFounder = await blockchain.contract
        .isFounder(blockchain.account);
      const owner = await blockchain.contract
        .owner();

      setClaimingNft(true);

      if (isFounder || (owner.toLowerCase() == blockchain.account)) {
        setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
        mint(0);
      } else if (isWhitelisted) {
        let whitelist_price = await blockchain.contract
          .getWhitelistPrice();
        
        whitelist_price = whitelist_price * BigInt(mintAmount);

        setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
        mint(whitelist_price);
      } else {
        let cost = await blockchain.contract.getPrice();
        let totalCostWei = cost * BigInt(mintAmount);

        setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
        mint(totalCostWei);
      }
    }
  };
  
  const mint = async (totalCostWei) => {
    if ((data.totalMinted + mintAmount) <= CONFIG.MAX_SUPPLY) {
      let totalGasLimit = CONFIG.GAS_LIMIT * mintAmount;

      try {
        const to = blockchain.account;
        const settings = {
          value: String(totalCostWei),
          gasLimit: String(totalGasLimit)
        }
  
        const tx = await blockchain.contract.mint(mintAmount, to, settings);

        blockchain.contract.once(tx.hash, (receipt) => {
          console.log('Transaction Mined: - ', receipt);
        });
  
        const receipt = await tx.wait();
  
        console.log('Transaction Completed - ', receipt);

        setFeedback(`You've adopted a Mad Cow! Thank you so much!`);
        setClaimingNft(false);
      } catch (error) {
        const err = serializeError(error);
        const errorCode = err.data.originalError.code;

        if (errorCode == 'INSUFFICIENT_FUNDS') {
          setFeedback(`Please check you have sufficient funds to purchase your NFTs.`);
        } else if (errorCode == 'ACTION_REJECTED') {
          setFeedback(
            `Wallet confirmation rejected.`
          );
        } else {
          setFeedback(
            `Sorry, something went wrong, please contact a moderator of Cows Gone Mad on discord and give them this code: "${err.data.originalError.code}".`
          );
          console.log(err);
        }
        setClaimingNft(false);
      }
      
    } else {
      setFeedback('Not enough NFTs available, Please adjust the amount you would like to mint.');
    }
  }

  const getConfig = async (cb) => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();

    // Get Contract ABI
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    console.log('abi - ', abi);

    setABI(abi)
    SET_CONFIG(config);
    RPC_connection(abi, config);
  };

  useEffect(() => {
    getConfig();
  }, []);


  return (
    <main>
      <Header openseaURL={{
        openseaURL: CONFIG.OPENSEA
      }}/>
      <s.Screen style={{
        backgroundImage: `url('https://belgoteximagelibrarythumbnails.s3.eu-west-2.amazonaws.com/test/shattered.png')`,
        backgroundRepeat: 'repeat'
      }}>
        <s.Container
          flex={1}
          ai={"center"}
        >
          <s.ResponsiveWrapper flex={1} style={{ padding: "24px 0" }}>
            <s.SpacerLarge />
            <s.Container flex={2} jc={"center"} ai={"center"} >
              <s.TextTitle style={screebie.style} >
                {CONFIG.TITLE_ONE}
              </s.TextTitle>
              <s.TextTitle style={{ textAlign: "center" }} >
                {CONFIG.TITLE_TWO}
              </s.TextTitle>
              <s.TextSubTitle style={{ textAlign: "center", color: "#00f5d0" }} >
                {CONFIG.MAX_PER_WALLET}
              </s.TextSubTitle>
              <s.TextTitle style={screebie.style} >
                {data.totalMinted != 0
                  ? `${data.totalMinted} / ${CONFIG.MAX_SUPPLY}`
                  : `? / ${CONFIG.MAX_SUPPLY}`}
              </s.TextTitle>
              {Number(data.totalMinted) >= CONFIG.MAX_SUPPLY ? (
                <>
                  <s.TextTitle style={{ textAlign: "center" }} >
                    The sale has ended.
                  </s.TextTitle>
                  <s.TextDescription style={{ textAlign: "center" }} >
                    You can still find {CONFIG.NFT_NAME} on
                  </s.TextDescription>
                  <s.SpacerSmall />
                  <s.StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                    {CONFIG.MARKETPLACE}
                  </s.StyledLink>
                </>
              ) : (
                <>
                  <s.TextSubTitle style={{ textAlign: "center" }} >
                    1 Mad Cow NFT costs {CONFIG.DISPLAY_COST} MATIC
                  </s.TextSubTitle>
                  <s.TextDescription style={{ textAlign: "center" }} >
                    (Excluding gas fees)
                  </s.TextDescription>
                  <s.SpacerSmall />
                  {signer == null ? (
                    <s.Container ai={"center"} jc={"center"}>
                      <s.SpacerMedium/>
                      <MintInput mintAmount={mintAmount} setMintAmount={setMintAmount}/>
                      <s.SpacerSmall />
                      <s.StyledButton style={screebie.style}
                        onClick={(e) => {
                          e.preventDefault();
                          connectWallet()
                        }}
                        >
                        CONNECT WALLET
                      </s.StyledButton>
                      {walletError.length < 1 ? (
                      <>
                        <s.TextDescription style={{ textAlign: "center" }} >
                          Please connect your selected wallet
                        </s.TextDescription>
                      </>
                      ) :
                      <s.TextDescription style={{
                        color: "pink",
                        fontWeight: "700"
                        }}
                      >
                        {walletError}
                      </s.TextDescription>
                      }
                      <s.SpacerLarge/>
                      <s.TextSubTitle>
                        OR
                      </s.TextSubTitle>
                      <s.SpacerLarge/>
                      <CrossmintPayButton
                        collectionId="0ccab6f8-d0be-409e-a280-fab3db7b22dd"
                        projectId="f45596a2-278e-4e6c-92c0-3f78be7d3e73"
                        mintConfig={{
                          "type":"erc-721",
                          "totalPrice":ethers.formatEther(data.cost * mintAmount),
                          "_mintAmount":mintAmount,
                          "quantity":mintAmount
                        }}
                        environment="staging"
                          
                      />
                      <s.TextTitle
                        style={{
                          textAlign: "center",
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "white",
                          paddingTop: 25,
                        }}
                      >
                        {CONFIG.SOLD_OUT}
                      </s.TextTitle>
                    </s.Container>
                  ) : (
                    <>
                      <s.SpacerMedium />
                      <MintInput mintAmount={mintAmount} setMintAmount={setMintAmount}/>
                      <s.SpacerSmall />
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <s.StyledButton
                          style={screebie.style}
                          disabled={claimingNft ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            claimNFTs();
                          }}
                        >
                          {claimingNft ? "MINTING..." : "MINT"}
                        </s.StyledButton>
                      </s.Container>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "white",
                        }}
                      >
                        {feedback}
                      </s.TextDescription>
                    </>
                  )}
                </>
              )}
              <s.SpacerMedium />
            </s.Container>
          </s.ResponsiveWrapper>
          <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
            <s.TextDescription style={{ textAlign: "center" }} >
              Please make sure you are connected to the right network (
              {CONFIG.NETWORK.NAME}). <br />
              Please note: Once you make the purchase, you cannot undo this
              action.
            </s.TextDescription>
          </s.Container>
        </s.Container>
        <s.SpacerLarge />
      </s.Screen>
    </main>
  )
}
