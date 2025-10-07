import { getContract } from "thirdweb";
import { chain } from "../lib/thirdweb/chain";
import { client } from "../lib/thirdweb/client";

export const nameContract = getContract({
  client,
  chain: chain,
  address: "0xA8e00E2ca8b183Edb7EbB6bD7EeBB90047416F95",
});

export const hashcoinContract = getContract({
  client,
  chain: chain,
  address: "0xA9B631ABcc4fd0bc766d7C0C8fCbf866e2bB0445",
});

export const nftCollectionContract = getContract({
  client,
  chain: chain,
  address: "0x30ccb676de89af3da144dde2cff647152e5c2770",
});

export const earlyBirdContract = getContract({
  client,
  chain: chain,
  address: "0xe6DC0fe06C141329050A1B2F3e9c4A7f944450B0",
});

export const buyMeACoffeeContract = getContract({
  client,
  chain: chain,
  address: "0xb234a834daEa25BEEbAabD17233704E9736769f4",
  abi: [{"inputs":[{"internalType":"address","name":"_priceFeed","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"donor","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TipReceived","type":"event"},{"inputs":[],"name":"COFFEE_USD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"buyMeACoffee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"eligibleForRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCoffeePriceInETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEthPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getTotalTipsFromUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"isEligibleForRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"tipsFromUsers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"topDonor","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"topDonorAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCoffee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTips","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}],
});