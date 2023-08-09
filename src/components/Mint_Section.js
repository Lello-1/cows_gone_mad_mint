'use client'

import "dotenv/config";
import React, { useState } from "react";
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import { ethers, parseEther } from "ethers";
import { Web3Button } from '@web3modal/react';

import { polygon, polygonMumbai } from 'wagmi/chains';
import {
  useAccount,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';

import { serializeError } from 'eth-rpc-errors'
import MintInput from "./Mint_Input";
import localFont from "next/font/local";
import styles from "../app/styles/Global.module.css";

const screebie = localFont({
  src: '../app/fonts/screebie.ttf',
  weight: '700',
  display: 'swap'
});

// MINT SECTION COMPONENT
export default function Mint_Section({ appData, CONFIG, ABI }) {
  const [mintAmount, setMintAmount] = useState(1);
  const [feedback, setFeedback] = useState(`Click MINT to mint your NFT.`);
  const { address, isConnected } = useAccount();

  let paused;
  let isWhitelisted;
  let isFounder;
  let isOwner;
  let price = '0';
  
  const contract_read = {
    address: CONFIG.CONTRACT_ADDRESS,
    abi: ABI
  }
  
  const default_admin_role = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_ROLE;

  // Get contract data for mint logic
  const { data: contractData } = useContractReads({
    contracts: [
      {
        ...contract_read,
        functionName: 'paused',
        chainId: polygonMumbai.id
      },
      {
        ...contract_read,
        functionName: 'isWhitelisted',
        args: [address],
        chainId: polygonMumbai.id
      },
      {
        ...contract_read,
        functionName: 'isFounder',
        args: [address],
        chainId: polygonMumbai.id
      },
      {
        ...contract_read,
        functionName: 'hasRole',
        args: [default_admin_role, address],
        chainId: polygonMumbai.id
      },
      {
        ...contract_read,
        functionName: 'getWhitelistPrice',
        chainId: polygonMumbai.id
      },
      {
        ...contract_read,
        functionName: 'getPrice',
        chainId: polygonMumbai.id
      }
    ],
  });

  // Assign contract data if we are connected to Node
  if (address && contractData) {
    paused = contractData[0].result;
    isWhitelisted = contractData[1].result;
    isFounder = contractData[2].result;
    isOwner = contractData[3].result;
  }

  // Adjust price accordingly
  if (address && contractData) {
    if (isFounder || isOwner) {
      price = '0';
    } else if (isWhitelisted) {
      price = contractData[4].result * BigInt(mintAmount);
    } else {
      price = contractData[5].result * BigInt(mintAmount);
    }
  }

  // Prepare the mint function
  const { config } = usePrepareContractWrite({
    address: CONFIG.CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'mint',
    args: [mintAmount, address],
    value: parseEther(price)
  });

  // Write to mint function
  const { data, error, isLoading: writeLoading, write } = useContractWrite(config);

  // Check the transaction process
  const { isLoading: transactionLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  // Serialize RPC Error and print
  const handleRPCError = () => {
    if (error) {
      const err = serializeError(error);

      return err.data.originalError.shortMessage;
    }
  }
  
  // Call the write function for useContractWrite hook
  const mint = () => {
    if (paused) {
      setFeedback("The sale is not open yet.");
    } else {
      if ((appData.totalMinted + mintAmount) <= CONFIG.MAX_SUPPLY) {
   
        write?.();

      } else {
        setFeedback('Not enough NFTs available, Please adjust the amount you would like to mint.');
      }
    }
  }

  // Render Page
  return (
    <div>
      {Number(appData.totalMinted) >= CONFIG.MAX_SUPPLY ? (
        <>
          <h3
            className={styles.text_title}
            style={{ textAlign: "center" }}
          >
            The sale has ended.
          </h3>
          <p className={styles.text_description} style={{ textAlign: "center" }} >
            You can still find {CONFIG.NFT_NAME} on
          </p>
          <div className={styles.SpacerSmall} />
          <a className={styles.styled_link} target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
            {CONFIG.MARKETPLACE}
          </a>
        </>
      ) : (
        <div>
          <h6 
            className={styles.text_subtitle}
            style={{ textAlign: "center" }}
          >
            1 Mad Cow NFT costs {CONFIG.DISPLAY_COST} MATIC
          </h6>
          <p
            className={styles.text_description} style={{ textAlign: "center" }}
          >
            (Excluding gas fees)
          </p>
          <div className={styles.SpacerSmall} />
          {(!isConnected) ? (
            <div className={styles.container} >
              <div className={styles.spacerMedium} />
              <MintInput mintAmount={mintAmount} setMintAmount={setMintAmount}/>
              <div className={styles.spacerMedium} />
              <Web3Button />
              <div className={styles.spacerLarge} />
              <p className={styles.text_subtitle}>
                OR
              </p>
              <div className={styles.spacerLarge} />
              <CrossmintPayButton
                collectionId="0ccab6f8-d0be-409e-a280-fab3db7b22dd"
                projectId="f45596a2-278e-4e6c-92c0-3f78be7d3e73"
                mintConfig={{
                  "type":"erc-721",
                  "totalPrice":ethers.formatEther(BigInt(Number(appData.cost) * mintAmount)),
                  "_mintAmount":mintAmount,
                  "quantity":mintAmount
                }}
                environment="staging"
                  
              />
              <h3 className={styles.text_title}
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "white",
                  paddingTop: 25,
                }}
              >
                {CONFIG.SOLD_OUT}
              </h3>
            </div>
          ) : (
            <div className={styles.container}>
              <div className={styles.spacerMedium} />
              <MintInput mintAmount={mintAmount} setMintAmount={setMintAmount}/>
              <div className={styles.SpacerSmall} />
              <div
                className={styles.container}
                style={{ flexDirection: "row" }}
              >
                <button
                  className={styles.styled_button}
                  style={screebie.style}
                  disabled={writeLoading || transactionLoading ? true : false}
                  onClick={() => mint() } >
                  {writeLoading || transactionLoading ? "MINTING..." : "MINT"}
                </button>
              </div >
              <div className={styles.spacerMedium} />
              <p className={styles.text_description}
                style={{
                  textAlign: "center",
                  color: "white",
                }}
              >
                {handleRPCError() ? handleRPCError() : isSuccess ? data.hash ? `${CONFIG.NFT_NAME} NFT successful mint!` : feedback : feedback}
              </p >
              <p className={styles.text_description}
                style={{
                  textAlign: "center",
                  color: "white",
                }}>
                {isSuccess ? data.hash ? `Transaction: ${data.hash}` : '' : ''}
              </p>
              <div className={styles.spacerMedium} />
              <Web3Button />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
