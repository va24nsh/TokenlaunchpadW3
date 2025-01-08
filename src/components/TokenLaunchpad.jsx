import { createInitializeMint2Instruction, getMinimumBalanceForRentExemptAccount, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import React, { useState } from "react";

export default function TokenLaunchpad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState("");
  const { connection } = useConnection();
  const wallet = useWallet();

  const submit = async () => {
    if(!wallet.connected) {
      alert("Please connect your wallet");
      return;
    }
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID
      }),
      createInitializeMint2Instruction(mintKeypair.publicKey, 9, wallet.publicKey, wallet.publicKey, TOKEN_PROGRAM_ID)
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    await wallet.sendTransaction(transaction, connection);
    console.log(`Token mint created: ${mintKeypair.publicKey.toBase58()}`);
  }
  
    return (
    <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
        <h1>Token Launchpad</h1>
        {name && symbol && image && supply && <div></div>}
        <input type="text" placeholder="Name" onChange={(e) => {setName(e.target.value)}}/>
        <input onChange={(e) => {setSymbol(e.target.value)}} type="text" placeholder="Symbol"/>
        <input onChange={(e) => {setImage(e.target.value)}} type="text" placeholder="Image URL"/>
        <input onChange={(e) => {setSupply(e.target.value)}} type="text" placeholder="Initial Supply"/>
        <button className="btn" onClick={submit}>Create a token</button>
    </div>
    );
}