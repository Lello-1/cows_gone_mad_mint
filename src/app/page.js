'use client'

import "dotenv/config";
import React, { useEffect, useState } from "react";
import { ethers, Contract } from "ethers";
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';

import Header from "../components/Header";
import Mint_Section from "../components/Mint_Section";
import localFont from "next/font/local";
import styles from "./styles/Global.module.css";

const screebie = localFont({
  src: './fonts/screebie.ttf',
  weight: '700',
  display: 'swap'
});

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const chains = [polygon, polygonMumbai];

// Wallet Connect and Wagmi setup
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// HOME/PAGE COMPONENT
export default function Home() {
  const [data, setData] = useState({
    totalMinted: 0,
    cost: 0
  });
  const[ABI, setABI] = useState({});
  const [CONFIG, SET_CONFIG] = useState({
    NETWORK: { NAME: "" }
  });

  // RPC Connection to Polygon Node
  const RPC_connection = async (abi, config) => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Contract Object setup
    const contract = new Contract(
      config.CONTRACT_ADDRESS,
      abi,
      provider
    );

    // Get mint cost
    const cost = await contract.getPrice();
    const totalMinted = await contract.totalSupply();

    // Save Cost and totalMinted to state
    setData({
      cost: Number(cost),
      totalMinted: Number(totalMinted)
    });
    
  }

  // Get the Site Configuration
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

    setABI(abi)
    SET_CONFIG(config);
    RPC_connection(abi, config);
  };

  useEffect(() => {
    // Site Setup
    getConfig();
  }, []);


  return (
    <main>
      <WagmiConfig config={wagmiConfig}>
        <div className={styles.screen} >
          <Header socials={{
            websiteURL: CONFIG.WEBSITE,
            openseaURL: CONFIG.OPENSEA,
            twitterURL: CONFIG.TWITTER,
            discordURL: CONFIG.DISCORD,
            instagramURL: CONFIG.INSTAGRAM,
            roadmapURL: CONFIG.ROADMAP
          }}/>
          <div className={styles.container} >
            <div className={styles.responsive_wrapper}>
              <div className={styles.spacerLarge} />
              <div className={styles.container} >
                <h1 className={styles.text_title} style={screebie.style} >
                  {CONFIG.TITLE_ONE}
                </h1>
                <h6
                  className={styles.text_subtitle}
                  style={{ textAlign: "center", color: "#00f5d0" }}
                >
                  {CONFIG.MAX_PER_WALLET}
                </h6>
                <h3
                  className={styles.text_title}
                  style={screebie.style}
                >
                  {data.totalMinted != 0
                    ? `${data.totalMinted} / ${CONFIG.MAX_SUPPLY}`
                    : `? / ${CONFIG.MAX_SUPPLY}`}
                </h3>
                <Mint_Section
                  CONFIG={CONFIG}
                  appData={data}
                  ABI={ABI}
                />
                <div className={styles.spacerMedium} />
              </div>
            </div>
            <div className={styles.bottom_container}>
              <p className={styles.text_description} style={{ textAlign: "center" }} >
                Please make sure you are connected to the right network (
                {CONFIG.NETWORK.NAME}). <br />
                Please note: Once you make the purchase, you cannot undo this
                action.
              </p>
            </div>
          </div>
          <div className={styles.spacerLarge} />
        </div>
      </WagmiConfig>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          '--w3m-text-big-bold-font-family': '#00f5d0'
        }}
        explorerRecommendedWalletIds={[
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
          'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'
        ]}
      />
    </main>
  )
}
