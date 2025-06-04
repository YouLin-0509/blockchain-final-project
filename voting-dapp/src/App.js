import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import VotingMVP from "./abi/VotingMVP.json";

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // 本地合約地址

function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [candidates, setCandidates] = useState([0, 1, 2]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [account, setAccount] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accs[0]);
      const s = await provider.getSigner();
      setSigner(s);
      const c = new ethers.Contract(CONTRACT_ADDRESS, VotingMVP.abi, s);
      setContract(c);
      
      // 驗證合約連接
      const candidateCount = await c.candidateCount();
      console.log("合約連接成功，候選人數量:", candidateCount);
    } catch (error) {
      console.error("連接錢包時發生錯誤:", error);
      alert("連接錢包失敗：" + error.message);
    }
  };

  const registerVoter = async () => {
    await contract.registerVoter(account);
    alert("註冊成功！");
  };

  const submitVote = async () => {
    if (selected === null) return alert("請選擇候選人");
    await contract.submitVote(selected);
    alert("投票成功！");
  };

  const getResults = async () => {
    try {
      console.log("正在獲取投票結果...");
      const res = await contract.getResults();
      console.log("獲取到的結果:", res);
      if (res && Array.isArray(res)) {
        setResults(res.map(r => r.toString()));
      } else {
        console.error("無效的結果格式:", res);
        alert("獲取結果失敗：無效的數據格式");
      }
    } catch (error) {
      console.error("獲取結果時發生錯誤:", error);
      alert("獲取結果失敗：" + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>區塊鏈投票 DApp</h2>
      {!account && <button onClick={connectWallet}>連接錢包</button>}
      {account && (
        <>
          <div>錢包地址：{account}</div>
          <button onClick={registerVoter}>註冊成為選民</button>
          <div>
            <h3>投票</h3>
            {candidates.map((c, i) => (
              <label key={i} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="candidate"
                  value={i}
                  onChange={() => setSelected(i)}
                />
                候選人 {i}
              </label>
            ))}
            <button onClick={submitVote}>投票</button>
          </div>
          <div>
            <button onClick={getResults}>查詢結果</button>
            <ul>
              {results.map((r, i) => (
                <li key={i}>候選人 {i} 得票數：{r}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default App;