// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


contract FlowFit is AccessControl {
    using ECDSA for bytes32;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FUND_MANAGER = keccak256("FUND_MANAGER");

    bytes32 public constant REPORT_TYPEHASH = keccak256("ReportMissedDay(uint256 challengeId,uint64 dayIndex)");
    bytes32 public DOMAIN_SEPARATOR;

    struct Challenge {
        address participant;
        address appKey;
        bool finalized;
        uint64 startDate;
        uint64 totalDays;
        uint64 failedDays;
        bool[] missedDays;
        uint128 lockedAmount;
    }

    Challenge[] public challenges;

    event ChallengeCreated(address indexed participant, uint256 indexed challengeId);
    event ChallengeFinalized(address indexed participant, uint256 indexed challengeId, bool success);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("FlowFit")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function addManager(address verifier) external onlyRole(ADMIN_ROLE) {
        _grantRole(FUND_MANAGER, verifier);
    }

    function removeManager(address verifier) external onlyRole(ADMIN_ROLE) {
        _revokeRole(FUND_MANAGER, verifier);
    }

    function initiateChallenge(uint64 daysCount, address appKey) external payable returns (uint256) {
        require(msg.value > 0, "Deposit required");

        uint256 id = challenges.length;
        challenges.push();
        Challenge storage challenge = challenges[id];

        challenge.participant = msg.sender;
        challenge.appKey = appKey;
        challenge.startDate = getCurrentDay();
        challenge.totalDays = daysCount;
        challenge.lockedAmount = uint128(msg.value);
        challenge.failedDays = 0;
        challenge.missedDays = new bool[](daysCount);
        challenge.finalized = false;

        emit ChallengeCreated(msg.sender, id);
        return id;
    }

    function reportMissedDay(uint256 challengeId, uint64 dayIndex) external {
        Challenge storage c = challenges[challengeId];
        require(msg.sender == c.appKey, "Not authorized");
        require(!c.finalized, "Challenge ended");

        if (!c.missedDays[dayIndex]) {
            c.missedDays[dayIndex] = true;
            c.failedDays++;
        }
    }

    function reportMissedDayWithSignature(
        uint256 challengeId,
        uint64 dayIndex,
        bytes calldata signature
    ) external {
        Challenge storage c = challenges[challengeId];
        require(!c.finalized, "Challenge finalized");
        require(dayIndex < c.totalDays, "Invalid day index");

        // Recreate the signed hash
        bytes32 structHash = keccak256(abi.encode(REPORT_TYPEHASH, challengeId, dayIndex));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        // Recover signer from signature
        address signer = digest.recover(signature);
        require(signer == c.appKey, "Invalid signature");

        // Mark missed day
        if (!c.missedDays[dayIndex]) {
            c.missedDays[dayIndex] = true;
            c.failedDays++;
        }
    }

    function finalizeChallenge(uint256 challengeId) external {
        Challenge storage c = challenges[challengeId];
        require(msg.sender == c.appKey, "Not authorized");
        require(!c.finalized, "Already finalized");
        require(getCurrentDay() >= c.startDate + c.totalDays, "Challenge ongoing");

        c.finalized = true;

        uint128 refundAmount = (c.lockedAmount * (c.totalDays - c.failedDays)) / c.totalDays;

        (bool success, ) = payable(c.participant).call{value: refundAmount}("");
        require(success, "Refund failed");

        emit ChallengeFinalized(c.participant, challengeId, c.failedDays == 0);
    }

    function getChallenge(uint256 id) external view returns (Challenge memory) {
        return challenges[id];
    }

    function getCurrentDay() public view returns (uint64) {
        return uint64(block.timestamp) / 1 days / 1000;
    }

    function withdraw(address to, uint256 amount) external onlyRole(FUND_MANAGER) {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Withdraw failed");
    }

    receive() external payable {}
}
