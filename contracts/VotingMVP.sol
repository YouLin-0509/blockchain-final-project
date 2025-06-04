// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title VotingMVP
 * @dev 基礎投票合約的 MVP 版本
 */
contract VotingMVP {
    // 合約擁有者
    address public owner;
    
    // 選民註冊狀態
    mapping(address => bool) public registeredVoters;
    
    // 候選人票數
    mapping(uint256 => uint256) public candidateVotes;
    
    // 選民投票狀態
    mapping(address => bool) public hasVoted;
    
    // 候選人總數
    uint256 public candidateCount;
    
    // 事件
    event VoterRegistered(address indexed voter);
    event VoteSubmitted(address indexed voter, uint256 candidateId);
    event RegistrationClosed();
    
    // 修飾器
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "Not a registered voter");
        _;
    }
    
    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "Already voted");
        _;
    }
    
    // 建構函數
    constructor(uint256 _candidateCount) {
        owner = msg.sender;
        candidateCount = _candidateCount;
    }
    
    /**
     * @dev 註冊選民
     * @param voter 選民地址
     */
    function registerVoter(address voter) external onlyOwner {
        require(!registeredVoters[voter], "Voter already registered");
        registeredVoters[voter] = true;
        emit VoterRegistered(voter);
    }
    
    /**
     * @dev 提交投票
     * @param candidateId 候選人 ID
     */
    function submitVote(uint256 candidateId) external onlyRegisteredVoter hasNotVoted {
        require(candidateId < candidateCount, "Invalid candidate ID");
        
        hasVoted[msg.sender] = true;
        candidateVotes[candidateId]++;
        
        emit VoteSubmitted(msg.sender, candidateId);
    }
    
    /**
     * @dev 獲取投票結果
     * @return 所有候選人的得票數陣列
     */
    function getResults() external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](candidateCount);
        
        for (uint256 i = 0; i < candidateCount; i++) {
            results[i] = candidateVotes[i];
        }
        
        return results;
    }
    
    /**
     * @dev 關閉註冊
     */
    function closeRegistration() external onlyOwner {
        emit RegistrationClosed();
    }
} 