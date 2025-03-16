// AccountDataDisplay.js
/**
 * React component for displaying blockchain account information including ETH/token balances and transaction count
 * Integrates with Ethereum JSON-RPC provider and uses React Query for data fetching
 */

import React from 'react';
import { useState } from 'react';
import { ethers } from 'ethers'; // Ethereum library for interacting with blockchain
import { useQuery } from '@tanstack/react-query'; // Data fetching and caching library
import { Card, Table, Spinner, Form, Button } from 'react-bootstrap'; // UI components

// Hardcoded contract addresses for the token contracts (replace with actual deployed addresses)
const TOKEN_A_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const TOKEN_B_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const AccountDataDisplay = () => {
  // State management for address input
  const [address, setAddress] = useState(''); // Current input value
  const [inputAddress, setInputAddress] = useState(''); // Validated address for querying

  // Initialize Ethereum provider connection to local Hardhat node
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  // React Query configuration for data fetching
  const { data: accountData, isLoading, error } = useQuery({
    queryKey: ['account', inputAddress], // Unique key for caching
    queryFn: async () => { // Data fetching function
      // Validate input address format
      if (!ethers.utils.isAddress(inputAddress)) return null;

      // Fetch ETH balance
      const balance = await provider.getBalance(inputAddress);
      
      // Initialize token contract instances
      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, [
        'function balanceOf(address) view returns (uint256)'
      ], provider);
      
      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, [
        'function balanceOf(address) view returns (uint256)'
      ], provider);


      // Return formatted account data
      return {
        ethBalance: ethers.utils.formatEther(balance), // Convert wei to ETH
        tokenABalance: ethers.utils.formatUnits(await tokenA.balanceOf(inputAddress), 18),
        tokenBBalance: ethers.utils.formatUnits(await tokenB.balanceOf(inputAddress), 18),
        transactionCount: await provider.getTransactionCount(inputAddress),
        
      };
    },
    enabled: !!inputAddress // Only run query when valid address exists
  });

  return (
    <div className="p-4">
      {/* Address input form */}
      <Form onSubmit={(e) => {
        e.preventDefault();
        setInputAddress(address); // Trigger query on form submission
      }}>
        <Form.Group className="mb-3">
          <Form.Label>Account Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter 0x address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Load Data
        </Button>
      </Form>

      {/* Loading indicator */}
      {isLoading && <Spinner animation="border" className="mt-3" />}

      {/* Data display section */}
      {accountData && (
        <Card className="mt-3">
          <Card.Body>
            <Card.Title>Account Details</Card.Title>
            <Table striped bordered>
              <tbody>
                <tr>
                  <td>ETH Balance</td>
                  <td>{accountData.ethBalance} ETH</td>
                </tr>
                <tr>
                  <td>Token A Balance</td>
                  <td>{accountData.tokenABalance} TKA</td>
                </tr>
                <tr>
                  <td>Token B Balance</td>
                  <td>{accountData.tokenBBalance} TKB</td>
                </tr>
                <tr>
                  <td>Transaction Count</td>
                  <td>{accountData.transactionCount}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-3 text-danger">
          Error loading data: {error.message}
        </div>
      )}
    </div>
  );
};

export default AccountDataDisplay;