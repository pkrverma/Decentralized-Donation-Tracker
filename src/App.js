import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const contractAddress = "0xc59655a71D582D5dEB7B742Ff71Da95C6f8D2FBA";

const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "DonationReceived",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "donations",
    "outputs": [
      {
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDonationCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [donations, setDonations] = useState([]);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);

        const count = await contract.getDonationCount();
        let donationList = [];
        for (let i = 0; i < count; i++) {
          const donation = await contract.donations(i);
          donationList.push({
            donor: donation.donor,
            amount: ethers.formatEther(donation.amount),
            message: donation.message,
            timestamp: new Date(Number(donation.timestamp) * 1000).toLocaleString(),
          });
        }
        setDonations(donationList.reverse()); // Newest donations first
      } else {
        console.log("Please install MetaMask!");
      }
    };
    loadBlockchainData().catch(console.error);
  }, []);

  const donate = async () => {
    if (!contract || !message || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const parsedAmount = ethers.parseEther(amount);
      const tx = await contract.donate(message, {
        value: parsedAmount,
      });
      await tx.wait();
      alert("Donation successful!");
      window.location.reload();
    } catch (error) {
      console.error("Donation failed:", error);
      alert(`Donation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Decentralized Donation Tracker</h1>
        <p className="account">Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}</p>
      </header>

      <section className="donation-form">
        <h2>Make a Donation</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Your Message (e.g., 'Great project!')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          <button onClick={donate} disabled={loading}>
            {loading ? "Processing..." : "Donate Now"}
          </button>
        </div>
      </section>

      <section className="donation-feed">
        <h2>Donation Feed</h2>
        {donations.length === 0 ? (
          <p>No donations yet. Be the first!</p>
        ) : (
          <ul>
            {donations.map((d, index) => (
              <li key={index} className="donation-item">
                <span className="donor">{d.donor.slice(0, 6)}...{d.donor.slice(-4)}</span>
                <span className="amount">{d.amount} ETH</span>
                <span className="message">"{d.message}"</span>
                <span className="timestamp">{d.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;