const hre = require("hardhat");

async function main() {
  const CANDIDATE_COUNT = 3; // 設置候選人數量

  console.log("開始部署 VotingMVP 合約...");
  console.log(`候選人數量: ${CANDIDATE_COUNT}`);
  
  const VotingMVP = await hre.ethers.getContractFactory("VotingMVP");
  const votingContract = await VotingMVP.deploy(CANDIDATE_COUNT);

  await votingContract.waitForDeployment();

  const address = await votingContract.getAddress();
  console.log(`VotingMVP 合約已部署到: ${address}`);
  
  // 驗證部署
  const candidateCount = await votingContract.candidateCount();
  console.log(`合約中的候選人數量: ${candidateCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 