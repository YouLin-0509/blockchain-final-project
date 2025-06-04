const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingMVP", function () {
  let votingContract;
  let owner;
  let voter1;
  let voter2;
  const CANDIDATE_COUNT = 3;

  beforeEach(async function () {
    // 獲取測試帳戶
    [owner, voter1, voter2] = await ethers.getSigners();

    // 部署合約
    const VotingMVP = await ethers.getContractFactory("VotingMVP");
    votingContract = await VotingMVP.deploy(CANDIDATE_COUNT);
    await votingContract.waitForDeployment();
  });

  describe("基本功能測試", function () {
    it("應該正確設置候選人數量", async function () {
      expect(await votingContract.candidateCount()).to.equal(CANDIDATE_COUNT);
    });

    it("應該正確設置合約擁有者", async function () {
      expect(await votingContract.owner()).to.equal(owner.address);
    });
  });

  describe("選民註冊測試", function () {
    it("只有擁有者可以註冊選民", async function () {
      await expect(
        votingContract.connect(voter1).registerVoter(voter1.address)
      ).to.be.revertedWith("Only owner can call this function");

      await votingContract.registerVoter(voter1.address);
      expect(await votingContract.registeredVoters(voter1.address)).to.be.true;
    });

    it("不能重複註冊選民", async function () {
      await votingContract.registerVoter(voter1.address);
      await expect(
        votingContract.registerVoter(voter1.address)
      ).to.be.revertedWith("Voter already registered");
    });
  });

  describe("投票測試", function () {
    beforeEach(async function () {
      await votingContract.registerVoter(voter1.address);
      await votingContract.registerVoter(voter2.address);
    });

    it("只有註冊選民可以投票", async function () {
      const unregisteredVoter = (await ethers.getSigners())[3];
      await expect(
        votingContract.connect(unregisteredVoter).submitVote(0)
      ).to.be.revertedWith("Not a registered voter");
    });

    it("選民不能重複投票", async function () {
      await votingContract.connect(voter1).submitVote(0);
      await expect(
        votingContract.connect(voter1).submitVote(1)
      ).to.be.revertedWith("Already voted");
    });

    it("不能投給無效的候選人", async function () {
      await expect(
        votingContract.connect(voter1).submitVote(CANDIDATE_COUNT)
      ).to.be.revertedWith("Invalid candidate ID");
    });

    it("應該正確記錄投票結果", async function () {
      await votingContract.connect(voter1).submitVote(0);
      await votingContract.connect(voter2).submitVote(1);

      const results = await votingContract.getResults();
      expect(results[0]).to.equal(1);
      expect(results[1]).to.equal(1);
      expect(results[2]).to.equal(0);
    });
  });

  describe("事件測試", function () {
    it("應該發出正確的註冊事件", async function () {
      await expect(votingContract.registerVoter(voter1.address))
        .to.emit(votingContract, "VoterRegistered")
        .withArgs(voter1.address);
    });

    it("應該發出正確的投票事件", async function () {
      await votingContract.registerVoter(voter1.address);
      await expect(votingContract.connect(voter1).submitVote(0))
        .to.emit(votingContract, "VoteSubmitted")
        .withArgs(voter1.address, 0);
    });

    it("應該發出正確的註冊關閉事件", async function () {
      await expect(votingContract.closeRegistration())
        .to.emit(votingContract, "RegistrationClosed");
    });
  });
}); 