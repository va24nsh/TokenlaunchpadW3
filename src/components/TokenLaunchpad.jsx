import { createAssociatedTokenAccountInstruction, createInitializeInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import React, { useState } from "react";
import { pack } from '@solana/spl-token-metadata';

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
    const metadeta = {
      mint: mintKeypair.publicKey,
      name: 'LUC',
      symbol: 'L  ',
      uri: 'https://cdn.100xdevs.com/metadata.json',
      additionalMetadeta: []
    };
    const minLen = getMintLen([ExtensionType.MetadataPointer]);
    const packedData = pack(metadeta);
    const metaDataLen = TYPE_SIZE + LENGTH_SIZE + packedData.length;
    const lamports = await connection.getMinimumBalanceForRentExemption(minLen + metaDataLen);
    
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: minLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID
      }),
      createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
      createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadeta.name,
        symbol: metadeta.symbol,
        uri: metadeta.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey
      })  
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    await wallet.sendTransaction(transaction, connection);
    console.log(`Token mint created: ${mintKeypair.publicKey.toBase58()}`);

    const associatedToken = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    console.log(associatedToken.toBase58());

    const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedToken,
            wallet.publicKey,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID,
        ),
    );

    await wallet.sendTransaction(transaction2, connection);

    const transaction3 = new Transaction().add(
        createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
    );

    await wallet.sendTransaction(transaction3, connection);
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