import React from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useQuery } from '@tanstack/react-query';
import { Card, Table, Spinner, Form, Button } from 'react-bootstrap';

// Replace with your contract addresses
const TOKEN_A_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const TOKEN_B_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const AccountDataDisplay = () => {
  const [address, setAddress] = useState('');
  const [inputAddress, setInputAddress] = useState('');

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  const { data: accountData, isLoading, error } = useQuery({
    queryKey: ['account', inputAddress],
    queryFn: async () => {
      if (!ethers.utils.isAddress(inputAddress)) return null;

      // Get balances using v5 syntax
      const balance = await provider.getBalance(inputAddress);
      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, [
        'function balanceOf(address) view returns (uint256)'
      ], provider);
      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, [
        'function balanceOf(address) view returns (uint256)'
      ], provider);

      return {
        // Use ethers.utils for formatting
        ethBalance: ethers.utils.formatEther(balance),
        tokenABalance: ethers.utils.formatUnits(await tokenA.balanceOf(inputAddress), 18),
        tokenBBalance: ethers.utils.formatUnits(await tokenB.balanceOf(inputAddress), 18),
        transactionCount: await provider.getTransactionCount(inputAddress)
      };
    },
    enabled: !!inputAddress
  });

  return (
    <div className="p-4">
      <Form onSubmit={(e) => { e.preventDefault(); setInputAddress(address); }}>
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

      {isLoading && <Spinner animation="border" className="mt-3" />}

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

      {error && (
        <div className="mt-3 text-danger">
          Error loading data: {error.message}
        </div>
      )}
    </div>
  );
};

export default AccountDataDisplay;