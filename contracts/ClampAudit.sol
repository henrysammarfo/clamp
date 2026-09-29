// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ClampAudit
/// @notice Append only mandate commits and decision receipts for CLAMP (Base Sepolia).
/// @dev Outcome codes use 1..4 so storage zero means unset:
///      1 = allow, 2 = block, 3 = review hold, 4 = revoke.
/// @custom:security Writers are limited to owner and approved recorders.
///      After revoke, no further decisions are accepted. This is an audit log,
///      not a custody vault. It does not move funds.
contract ClampAudit {
    address public owner;

    mapping(address => bool) public isRecorder;

    struct MandateMeta {
        bool exists;
        bool revoked;
        address committer;
        uint64 committedAt;
    }

    struct DecisionMeta {
        bool exists;
        bytes32 mandateHash;
        uint8 outcome;
        address actor;
        uint64 recordedAt;
    }

    mapping(bytes32 => MandateMeta) private _mandates;
    mapping(bytes32 => DecisionMeta) private _decisions;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event RecorderUpdated(address indexed recorder, bool allowed);
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
    event MandateRevoked(
        bytes32 indexed mandateHash,
        bytes32 indexed decisionHash,
        address indexed actor,
        uint256 timestamp
    );

    error NotOwner();
    error NotWriter();
    error ZeroAddress();
    error EmptyHash();
    error InvalidOutcome();
    error MandateMissing();
    error MandateAlreadyCommitted();
    error MandateAlreadyRevoked();
    error DecisionAlreadyRecorded();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyWriter() {
        if (msg.sender != owner && !isRecorder[msg.sender]) revert NotWriter();
        _;
    }

    constructor() {
        owner = msg.sender;
        isRecorder[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
        emit RecorderUpdated(msg.sender, true);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    function setRecorder(address recorder, bool allowed) external onlyOwner {
        if (recorder == address(0)) revert ZeroAddress();
        isRecorder[recorder] = allowed;
        emit RecorderUpdated(recorder, allowed);
    }

    function mandateExists(bytes32 mandateHash) external view returns (bool) {
        return _mandates[mandateHash].exists;
    }

    function isMandateRevoked(
        bytes32 mandateHash
    ) external view returns (bool) {
        return _mandates[mandateHash].revoked;
    }

    function getMandate(
        bytes32 mandateHash
    )
        external
        view
        returns (
            bool exists,
            bool revoked,
            address committer,
            uint64 committedAt
        )
    {
        MandateMeta memory meta = _mandates[mandateHash];
        return (meta.exists, meta.revoked, meta.committer, meta.committedAt);
    }

    function decisionExists(bytes32 decisionHash) external view returns (bool) {
        return _decisions[decisionHash].exists;
    }

    /// @notice Returns stored outcome (1..4) or 0 if unset.
    function decisionOutcome(
        bytes32 decisionHash
    ) external view returns (uint8) {
        return _decisions[decisionHash].outcome;
    }

    function getDecision(
        bytes32 decisionHash
    )
        external
        view
        returns (
            bool exists,
            bytes32 mandateHash,
            uint8 outcome,
            address actor,
            uint64 recordedAt
        )
    {
        DecisionMeta memory meta = _decisions[decisionHash];
        return (
            meta.exists,
            meta.mandateHash,
            meta.outcome,
            meta.actor,
            meta.recordedAt
        );
    }

    function commitMandate(bytes32 mandateHash) external onlyWriter {
        if (mandateHash == bytes32(0)) revert EmptyHash();
        MandateMeta storage meta = _mandates[mandateHash];
        if (meta.exists) revert MandateAlreadyCommitted();

        meta.exists = true;
        meta.revoked = false;
        meta.committer = msg.sender;
        meta.committedAt = uint64(block.timestamp);

        emit MandateCommitted(mandateHash, msg.sender, block.timestamp);
    }

    /// @param outcome 1=allow, 2=block, 3=review, 4=revoke
    function recordDecision(
        bytes32 mandateHash,
        bytes32 decisionHash,
        uint8 outcome
    ) external onlyWriter {
        if (mandateHash == bytes32(0) || decisionHash == bytes32(0)) {
            revert EmptyHash();
        }
        if (outcome < 1 || outcome > 4) revert InvalidOutcome();

        MandateMeta storage mandate = _mandates[mandateHash];
        if (!mandate.exists) revert MandateMissing();
        if (mandate.revoked) revert MandateAlreadyRevoked();

        DecisionMeta storage decision = _decisions[decisionHash];
        if (decision.exists) revert DecisionAlreadyRecorded();

        decision.exists = true;
        decision.mandateHash = mandateHash;
        decision.outcome = outcome;
        decision.actor = msg.sender;
        decision.recordedAt = uint64(block.timestamp);

        if (outcome == 4) {
            mandate.revoked = true;
            emit MandateRevoked(
                mandateHash,
                decisionHash,
                msg.sender,
                block.timestamp
            );
        }

        emit DecisionRecorded(
            mandateHash,
            decisionHash,
            outcome,
            msg.sender,
            block.timestamp
        );
    }
}
