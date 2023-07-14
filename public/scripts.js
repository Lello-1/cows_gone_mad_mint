import 'dotenv/config';
import { ethers, JsonRpcProvider } from "ethers";

const { ALCHEMY_ID } = process.env;

const provider = new JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_ID}`)