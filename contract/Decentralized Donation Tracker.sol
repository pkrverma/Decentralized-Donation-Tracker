// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationTracker {
    // Structure to store donation details
    struct Donation {
        address donor;       // Who sent the donation
        uint256 amount;      // Amount donated (in wei)
        string message;      // Thank-you message from donor
        uint256 timestamp;   // When the donation was made
    }

    // Array to store all donations
    Donation[] public donations;

    // Address of the contract owner (who receives donations)
    address public owner;

    // Event to notify when a donation is made
    event DonationReceived(address indexed donor, uint256 amount, string message);

    // Constructor sets the contract deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // Function to donate ETH and leave a message
    function donate(string memory _message) public payable {
        require(msg.value > 0, "Donation amount must be greater than 0");

        // Create a new donation record
        Donation memory newDonation = Donation({
            donor: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        });

        // Add to the donations array
        donations.push(newDonation);

        // Emit an event
        emit DonationReceived(msg.sender, msg.value, _message);

        // Transfer the donation to the owner
        (bool sent, ) = owner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    // Function to get the total number of donations
    function getDonationCount() public view returns (uint256) {
        return donations.length;
    }

    // Function to withdraw funds (only owner)
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint256 balance = address(this).balance;
        (bool sent, ) = owner.call{value: balance}("");
        require(sent, "Failed to withdraw Ether");
    }
}
