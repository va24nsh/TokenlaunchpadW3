import React, { useState } from "react";

export default function TokenLaunchpad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState("");

  const submit = () => {
    alert(name + " " + symbol + " " + image + " " + supply);
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