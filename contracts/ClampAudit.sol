// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ClampAudit
/// @notice Henry owned on chain mandate commits and decision receipts for CLAMP.
/// @dev Outcome codes: 0 = allow, 1 = block, 2 = review hold, 3 = revoke
contract ClampAudit {
    event MandateCommitted(
        bytes32 indexed mandateHash,
        address indexed actor,
        uint256 timestamp
    );

    event DecisionRecorded(
        bytes32 indexed mandateHash,
        bytes32 indexed decisionHash,
        uint8 outcome,
        address indexed actor,
        uint256 timestamp
    );

    mapping(bytes32 => bool) public mandateExists;
    mapping(bytes32 => bool) public decisionExists;
    mapping(bytes32 => uint8) public decisionOutcome;

    function commitMandate(bytes32 mandateHash) external {
        require(mandateHash != bytes32(0), "empty mandate hash");
        require(!mandateExists[mandateHash], "mandate already committed");
        mandateExists[mandateHash] = true;
        emit MandateCommitted(mandateHash, msg.sender, block.timestamp);
    }

    function recordDecision(
        bytes32 mandateHash,
        bytes32 decisionHash,
        uint8 outcome
    ) external {
        require(mandateHash != bytes32(0), "empty mandate hash");
        require(decisionHash != bytes32(0), "empty decision hash");
        require(outcome <= 3, "invalid outcome");
        require(mandateExists[mandateHash], "unknown mandate");
        require(!decisionExists[decisionHash], "decision already recorded");
        decisionExists[decisionHash] = true;
        decisionOutcome[decisionHash] = outcome;
        emit DecisionRecorded(
            mandateHash,
            decisionHash,
            outcome,
            msg.sender,
            block.timestamp
        );
    }
}
