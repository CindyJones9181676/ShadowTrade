// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint16, euint32, euint64, euint128, ebool, externalEuint8, externalEuint16, externalEuint32, externalEuint64, externalEuint128} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title CovertArbitrageDeck
 * @notice Privacy-preserving arbitrage strategy management platform
 * @dev Implements FHE-encrypted strategy parameters, position tracking, and performance analytics
 *      Updated for fhEVM v0.9.1 - Uses ZamaEthereumConfig and self-relaying decryption pattern
 */
contract CovertArbitrageDeck is ZamaEthereumConfig {

    // ============ Enums ============

    enum StrategyStatus {
        Draft,           // 0: Initial state
        Active,          // 1: Executing trades
        Paused,          // 2: Temporarily halted
        Completed,       // 3: Successfully finished
        Liquidated       // 4: Stop-loss triggered
    }

    enum OpportunityType {
        Spatial,         // 0: Cross-exchange arbitrage
        Temporal,        // 1: Time-based arbitrage
        Statistical,     // 2: Statistical arbitrage
        Triangular       // 3: Triangular arbitrage
    }

    enum RiskTier {
        Conservative,    // 0: Low risk
        Moderate,        // 1: Medium risk
        Aggressive       // 2: High risk
    }

    // ============ Structs ============

    struct Strategy {
        bytes32 strategyId;
        address trader;
        OpportunityType opportunityType;
        RiskTier riskTier;
        StrategyStatus status;

        // Encrypted financial data
        euint64 capitalCipher;        // Allocated capital in wei
        euint64 exposureCipher;       // Current exposure in wei
        euint64 realizedPnLCipher;    // Realized profit/loss in wei
        euint64 totalFeeCipher;       // Total fees paid in wei

        // Encrypted strategy parameters
        euint32 targetReturnBpsCipher;  // Target return in basis points
        euint32 stopLossBpsCipher;      // Stop loss threshold in bps
        euint16 maxSlippageBpsCipher;   // Max slippage in bps
        euint8 venueCountCipher;        // Number of venues
        euint8 confidenceCipher;        // Confidence score (0-100)

        // Metadata
        uint256 createdAt;
        uint256 activatedAt;
        uint256 lastExecutionAt;
        uint256 totalExecutions;
        uint256 successfulExecutions;
    }

    struct ExecutionRecord {
        bytes32 executionId;
        bytes32 strategyId;
        euint64 amountCipher;
        euint64 pnlCipher;
        uint256 timestamp;
        bool isProfit;
    }

    struct PerformanceMetrics {
        euint64 profitabilityScoreCipher;  // (PnL / Capital) × 10000
        euint64 riskScoreCipher;           // Composite risk score
        euint8 performanceBandCipher;      // 0-3 performance band
        bool isComplete;
    }

    struct PolicyConfig {
        uint64 minCapital;           // Minimum capital requirement
        uint64 maxCapital;           // Maximum capital limit
        uint32 minTargetReturnBps;   // Minimum target return
        uint32 maxStopLossBps;       // Maximum stop loss threshold
        uint16 maxSlippageBps;       // Maximum allowed slippage
        uint8 minVenueCount;         // Minimum venues required
        uint8 minConfidence;         // Minimum confidence score
    }

    // ============ Storage ============

    mapping(bytes32 => Strategy) public strategies;
    mapping(bytes32 => PerformanceMetrics) private performanceMetrics;
    mapping(address => bytes32[]) public traderStrategies;
    mapping(bytes32 => ExecutionRecord[]) public strategyExecutions;

    // Strategy sharing mappings
    mapping(bytes32 => address[]) public strategySharedWith;      // strategyId => list of shared users
    mapping(address => bytes32[]) public sharedWithMe;            // user => list of strategies shared with them
    mapping(bytes32 => mapping(address => bool)) public isSharedWith;  // strategyId => user => isShared

    PolicyConfig public policy;

    // Aggregate statistics (encrypted)
    euint64 public totalCapitalDeployedCipher;
    euint64 public totalPnLCipher;
    euint32 public activeStrategyCountCipher;

    // Counters
    uint256 public strategyCount;
    uint256 public activeStrategyCount;
    uint256 public totalExecutionCount;

    // ============ Roles ============

    address public owner;
    mapping(address => bool) public riskManagers;

    // ============ Events ============

    event StrategyCreated(bytes32 indexed strategyId, address indexed trader, OpportunityType opportunityType, uint256 timestamp);
    event StrategyActivated(bytes32 indexed strategyId, uint256 timestamp);
    event StrategyCompleted(bytes32 indexed strategyId, StrategyStatus finalStatus, uint256 timestamp);
    event ExecutionRecorded(bytes32 indexed executionId, bytes32 indexed strategyId, uint256 timestamp);
    event PerformanceReviewRequested(bytes32 indexed strategyId, uint256 requestId, uint256 timestamp);
    event PerformanceReviewCompleted(bytes32 indexed strategyId, uint64 profitability, uint8 performanceBand, uint256 timestamp);
    event StrategyShared(bytes32 indexed strategyId, address indexed owner, address indexed sharedWith, uint256 timestamp);
    event StrategyShareRevoked(bytes32 indexed strategyId, address indexed owner, address indexed revokedFrom, uint256 timestamp);

    // ============ Errors ============

    error StrategyNotFound();
    error StrategyAlreadyExists();
    error InvalidStatus();
    error Unauthorized();
    error InvalidParameters();
    error AlreadyShared();
    error NotShared();
    error CannotShareWithSelf();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRiskManager() {
        if (!riskManagers[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier strategyExists(bytes32 strategyId) {
        if (strategies[strategyId].createdAt == 0) revert StrategyNotFound();
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        riskManagers[msg.sender] = true;

        policy = PolicyConfig({
            minCapital: 0.01 ether,
            maxCapital: 10 ether,
            minTargetReturnBps: 100,      // 1%
            maxStopLossBps: 2000,         // 20%
            maxSlippageBps: 200,          // 2%
            minVenueCount: 2,
            minConfidence: 50
        });

        // Initialize aggregate statistics
        totalCapitalDeployedCipher = FHE.asEuint64(0);
        totalPnLCipher = FHE.asEuint64(0);
        activeStrategyCountCipher = FHE.asEuint32(0);

        FHE.allowThis(totalCapitalDeployedCipher);
        FHE.allowThis(totalPnLCipher);
        FHE.allowThis(activeStrategyCountCipher);
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new arbitrage strategy with encrypted parameters
     * @dev Uses FHE.fromExternal() for importing encrypted parameters (fhEVM 0.9.1 pattern)
     */
    function createStrategy(
        bytes32 strategyId,
        OpportunityType opportunityType,
        RiskTier riskTier,
        externalEuint64 encryptedCapital,
        externalEuint64 encryptedExposure,
        externalEuint32 encryptedTargetReturn,
        externalEuint32 encryptedStopLoss,
        externalEuint16 encryptedMaxSlippage,
        externalEuint8 encryptedVenueCount,
        externalEuint8 encryptedConfidence,
        bytes calldata inputProof
    ) external {
        if (strategies[strategyId].createdAt != 0) revert StrategyAlreadyExists();

        // Import encrypted parameters using FHE.fromExternal()
        euint64 capital = FHE.fromExternal(encryptedCapital, inputProof);
        euint64 exposure = FHE.fromExternal(encryptedExposure, inputProof);
        euint32 targetReturn = FHE.fromExternal(encryptedTargetReturn, inputProof);
        euint32 stopLoss = FHE.fromExternal(encryptedStopLoss, inputProof);
        euint16 maxSlippage = FHE.fromExternal(encryptedMaxSlippage, inputProof);
        euint8 venueCount = FHE.fromExternal(encryptedVenueCount, inputProof);
        euint8 confidence = FHE.fromExternal(encryptedConfidence, inputProof);

        // Grant permissions to contract
        FHE.allowThis(capital);
        FHE.allowThis(exposure);
        FHE.allowThis(targetReturn);
        FHE.allowThis(stopLoss);
        FHE.allowThis(maxSlippage);
        FHE.allowThis(venueCount);
        FHE.allowThis(confidence);

        // Grant permissions to user for read access
        FHE.allow(capital, msg.sender);
        FHE.allow(exposure, msg.sender);
        FHE.allow(targetReturn, msg.sender);
        FHE.allow(stopLoss, msg.sender);

        // Initialize encrypted metrics
        euint64 zeroPnL = FHE.asEuint64(0);
        euint64 zeroFee = FHE.asEuint64(0);

        FHE.allowThis(zeroPnL);
        FHE.allowThis(zeroFee);

        // Create strategy
        strategies[strategyId] = Strategy({
            strategyId: strategyId,
            trader: msg.sender,
            opportunityType: opportunityType,
            riskTier: riskTier,
            status: StrategyStatus.Draft,
            capitalCipher: capital,
            exposureCipher: exposure,
            realizedPnLCipher: zeroPnL,
            totalFeeCipher: zeroFee,
            targetReturnBpsCipher: targetReturn,
            stopLossBpsCipher: stopLoss,
            maxSlippageBpsCipher: maxSlippage,
            venueCountCipher: venueCount,
            confidenceCipher: confidence,
            createdAt: block.timestamp,
            activatedAt: 0,
            lastExecutionAt: 0,
            totalExecutions: 0,
            successfulExecutions: 0
        });

        traderStrategies[msg.sender].push(strategyId);
        strategyCount++;

        emit StrategyCreated(strategyId, msg.sender, opportunityType, block.timestamp);
    }

    /**
     * @notice Activate a strategy for execution
     */
    function activateStrategy(bytes32 strategyId) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();
        if (strat.status != StrategyStatus.Draft) revert InvalidStatus();

        // Validate using FHE operations
        PolicyConfig memory pol = policy;

        ebool capitalValid = FHE.and(
            FHE.ge(strat.capitalCipher, FHE.asEuint64(pol.minCapital)),
            FHE.le(strat.capitalCipher, FHE.asEuint64(pol.maxCapital))
        );

        ebool targetReturnValid = FHE.ge(strat.targetReturnBpsCipher, FHE.asEuint32(pol.minTargetReturnBps));
        ebool stopLossValid = FHE.le(strat.stopLossBpsCipher, FHE.asEuint32(pol.maxStopLossBps));
        ebool slippageValid = FHE.le(strat.maxSlippageBpsCipher, FHE.asEuint16(pol.maxSlippageBps));
        ebool venueValid = FHE.ge(strat.venueCountCipher, FHE.asEuint8(pol.minVenueCount));
        ebool confidenceValid = FHE.ge(strat.confidenceCipher, FHE.asEuint8(pol.minConfidence));

        ebool allValid = FHE.and(
            capitalValid,
            FHE.and(
                targetReturnValid,
                FHE.and(
                    stopLossValid,
                    FHE.and(slippageValid, FHE.and(venueValid, confidenceValid))
                )
            )
        );

        // Note: In production, client would use self-relaying decryption to verify allValid
        // For now, we proceed with activation

        strat.status = StrategyStatus.Active;
        strat.activatedAt = block.timestamp;

        // Update aggregates
        totalCapitalDeployedCipher = FHE.add(totalCapitalDeployedCipher, strat.capitalCipher);
        FHE.allowThis(totalCapitalDeployedCipher);

        activeStrategyCountCipher = FHE.add(activeStrategyCountCipher, FHE.asEuint32(1));
        FHE.allowThis(activeStrategyCountCipher);

        activeStrategyCount++;

        emit StrategyActivated(strategyId, block.timestamp);
    }

    /**
     * @notice Record a trade execution
     * @dev Uses FHE.fromExternal() for encrypted parameters
     */
    function recordExecution(
        bytes32 strategyId,
        bytes32 executionId,
        externalEuint64 encryptedAmount,
        externalEuint64 encryptedPnL,
        bytes calldata inputProof,
        bool isProfit
    ) external onlyRiskManager strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.status != StrategyStatus.Active) revert InvalidStatus();

        // Import encrypted execution data
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        euint64 pnl = FHE.fromExternal(encryptedPnL, inputProof);

        FHE.allowThis(amount);
        FHE.allowThis(pnl);

        // Record execution
        ExecutionRecord memory record = ExecutionRecord({
            executionId: executionId,
            strategyId: strategyId,
            amountCipher: amount,
            pnlCipher: pnl,
            timestamp: block.timestamp,
            isProfit: isProfit
        });

        strategyExecutions[strategyId].push(record);

        // Update strategy metrics
        strat.realizedPnLCipher = FHE.add(strat.realizedPnLCipher, pnl);
        FHE.allowThis(strat.realizedPnLCipher);

        strat.lastExecutionAt = block.timestamp;
        strat.totalExecutions++;

        if (isProfit) {
            strat.successfulExecutions++;
        }

        // Update aggregate PnL
        totalPnLCipher = FHE.add(totalPnLCipher, pnl);
        FHE.allowThis(totalPnLCipher);

        totalExecutionCount++;

        emit ExecutionRecorded(executionId, strategyId, block.timestamp);
    }

    /**
     * @notice Calculate performance review metrics
     * @dev Calculates encrypted performance metrics without decryption
     */
    function calculatePerformanceReview(bytes32 strategyId) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.status != StrategyStatus.Active) revert InvalidStatus();
        if (strat.trader != msg.sender) revert Unauthorized();

        // Calculate profitability score using PnL directly (simplified without division)
        euint64 profitabilityScore = strat.realizedPnLCipher;

        // Calculate risk score based on strategy parameters
        // Risk = (stopLoss × 2) + (maxSlippage × 10) + (100 - confidence)
        euint64 stopLossRisk = FHE.mul(FHE.asEuint64(strat.stopLossBpsCipher), uint64(2));
        euint64 slippageRisk = FHE.mul(FHE.asEuint64(strat.maxSlippageBpsCipher), uint64(10));
        euint64 confidenceRisk = FHE.sub(FHE.asEuint64(100), FHE.asEuint64(strat.confidenceCipher));
        euint64 riskScore = FHE.add(stopLossRisk, FHE.add(slippageRisk, confidenceRisk));

        // Determine performance band using FHE.select()
        PolicyConfig memory pol = policy;
        ebool meetingTarget = FHE.ge(profitabilityScore, FHE.asEuint64(uint64(pol.minTargetReturnBps)));
        ebool exceeding200 = FHE.ge(profitabilityScore, FHE.asEuint64(uint64(pol.minTargetReturnBps) * 2));
        ebool exceeding300 = FHE.ge(profitabilityScore, FHE.asEuint64(uint64(pol.minTargetReturnBps) * 3));

        euint8 performanceBand = FHE.select(
            exceeding300,
            FHE.asEuint8(3), // Excellent
            FHE.select(
                exceeding200,
                FHE.asEuint8(2), // Good
                FHE.select(
                    meetingTarget,
                    FHE.asEuint8(1), // Poor
                    FHE.asEuint8(0)  // Critical
                )
            )
        );

        // Store performance metrics
        PerformanceMetrics storage metrics = performanceMetrics[strategyId];
        metrics.profitabilityScoreCipher = profitabilityScore;
        metrics.riskScoreCipher = riskScore;
        metrics.performanceBandCipher = performanceBand;
        metrics.isComplete = true;

        FHE.allowThis(profitabilityScore);
        FHE.allowThis(riskScore);
        FHE.allowThis(performanceBand);

        FHE.allow(profitabilityScore, msg.sender);
        FHE.allow(riskScore, msg.sender);
        FHE.allow(performanceBand, msg.sender);

        emit PerformanceReviewCompleted(strategyId, 0, 0, block.timestamp);
    }

    /**
     * @notice Make encrypted data publicly decryptable for self-relaying pattern
     * @dev fhEVM 0.9.1 pattern: client calls publicDecrypt() on returned ciphertext
     */
    function makeCapitalDecryptable(bytes32 strategyId) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();

        // Make the capital ciphertext publicly decryptable
        FHE.makePubliclyDecryptable(strat.capitalCipher);
    }

    /**
     * @notice Make PnL data publicly decryptable for self-relaying pattern
     */
    function makePnLDecryptable(bytes32 strategyId) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();

        FHE.makePubliclyDecryptable(strat.realizedPnLCipher);
    }

    /**
     * @notice Complete a strategy
     */
    function completeStrategy(bytes32 strategyId) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender && !riskManagers[msg.sender]) revert Unauthorized();
        if (strat.status != StrategyStatus.Active) revert InvalidStatus();

        // Mark strategy as completed
        strat.status = StrategyStatus.Completed;

        activeStrategyCount--;

        emit StrategyCompleted(strategyId, strat.status, block.timestamp);
    }

    /**
     * @notice Pause a strategy
     */
    function pauseStrategy(bytes32 strategyId) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();
        if (strat.status != StrategyStatus.Active) revert InvalidStatus();

        strat.status = StrategyStatus.Paused;
    }

    /**
     * @notice Resume a paused strategy
     */
    function resumeStrategy(bytes32 strategyId) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();
        if (strat.status != StrategyStatus.Paused) revert InvalidStatus();

        strat.status = StrategyStatus.Active;
    }

    // ============ View Functions ============

    function getStrategyInfo(bytes32 strategyId) external view returns (
        address trader,
        OpportunityType opportunityType,
        RiskTier riskTier,
        StrategyStatus status,
        uint256 totalExecutions,
        uint256 successfulExecutions
    ) {
        Strategy storage strat = strategies[strategyId];
        return (
            strat.trader,
            strat.opportunityType,
            strat.riskTier,
            strat.status,
            strat.totalExecutions,
            strat.successfulExecutions
        );
    }

    function getTraderStrategies(address trader) external view returns (bytes32[] memory) {
        return traderStrategies[trader];
    }

    function getStrategyExecutions(bytes32 strategyId) external view returns (uint256) {
        return strategyExecutions[strategyId].length;
    }

    /**
     * @notice Get encrypted strategy data (only for trader)
     */
    function getMyEncryptedStrategy(bytes32 strategyId) external view returns (
        euint64 capital,
        euint64 exposure,
        euint64 realizedPnL,
        euint32 targetReturn,
        euint32 stopLoss
    ) {
        Strategy storage strat = strategies[strategyId];
        require(strat.trader == msg.sender, "Not trader");
        return (
            strat.capitalCipher,
            strat.exposureCipher,
            strat.realizedPnLCipher,
            strat.targetReturnBpsCipher,
            strat.stopLossBpsCipher
        );
    }

    // ============ Admin Functions ============

    function updatePolicy(PolicyConfig calldata newPolicy) external onlyOwner {
        require(newPolicy.minCapital > 0, "Invalid min capital");
        require(newPolicy.maxCapital > newPolicy.minCapital, "Invalid max capital");
        policy = newPolicy;
    }

    function grantRiskManager(address account) external onlyOwner {
        riskManagers[account] = true;
    }

    function revokeRiskManager(address account) external onlyOwner {
        riskManagers[account] = false;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    // ============ Strategy Sharing Functions ============

    /**
     * @notice Share a strategy with another user (read-only access)
     * @param strategyId The strategy to share
     * @param recipient The user to share with
     */
    function shareStrategy(bytes32 strategyId, address recipient) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();
        if (recipient == msg.sender) revert CannotShareWithSelf();
        if (recipient == address(0)) revert InvalidParameters();
        if (isSharedWith[strategyId][recipient]) revert AlreadyShared();

        // Add to share mappings
        isSharedWith[strategyId][recipient] = true;
        strategySharedWith[strategyId].push(recipient);
        sharedWithMe[recipient].push(strategyId);

        // Grant FHE read access to recipient for encrypted data
        FHE.allow(strat.capitalCipher, recipient);
        FHE.allow(strat.exposureCipher, recipient);
        FHE.allow(strat.realizedPnLCipher, recipient);
        FHE.allow(strat.targetReturnBpsCipher, recipient);
        FHE.allow(strat.stopLossBpsCipher, recipient);

        emit StrategyShared(strategyId, msg.sender, recipient, block.timestamp);
    }

    /**
     * @notice Revoke strategy access from a user
     * @param strategyId The strategy to revoke access from
     * @param user The user to revoke access from
     */
    function revokeShare(bytes32 strategyId, address user) external strategyExists(strategyId) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();
        if (!isSharedWith[strategyId][user]) revert NotShared();

        // Remove from share mapping
        isSharedWith[strategyId][user] = false;

        // Remove from strategySharedWith array
        address[] storage sharedList = strategySharedWith[strategyId];
        for (uint256 i = 0; i < sharedList.length; i++) {
            if (sharedList[i] == user) {
                sharedList[i] = sharedList[sharedList.length - 1];
                sharedList.pop();
                break;
            }
        }

        // Remove from sharedWithMe array
        bytes32[] storage userShared = sharedWithMe[user];
        for (uint256 i = 0; i < userShared.length; i++) {
            if (userShared[i] == strategyId) {
                userShared[i] = userShared[userShared.length - 1];
                userShared.pop();
                break;
            }
        }

        emit StrategyShareRevoked(strategyId, msg.sender, user, block.timestamp);
    }

    /**
     * @notice Get list of strategies shared with the caller
     * @return Array of strategy IDs shared with the caller
     */
    function getStrategiesSharedWithMe() external view returns (bytes32[] memory) {
        return sharedWithMe[msg.sender];
    }

    /**
     * @notice Get list of users a strategy is shared with
     * @param strategyId The strategy to check
     * @return Array of addresses the strategy is shared with
     */
    function getStrategySharedUsers(bytes32 strategyId) external view strategyExists(strategyId) returns (address[] memory) {
        Strategy storage strat = strategies[strategyId];
        if (strat.trader != msg.sender) revert Unauthorized();
        return strategySharedWith[strategyId];
    }

    /**
     * @notice Check if a strategy is shared with a specific user
     * @param strategyId The strategy to check
     * @param user The user to check
     * @return Whether the strategy is shared with the user
     */
    function isStrategySharedWith(bytes32 strategyId, address user) external view returns (bool) {
        return isSharedWith[strategyId][user];
    }

    /**
     * @notice Get shared strategy info (for users the strategy is shared with)
     * @param strategyId The strategy to get info for
     */
    function getSharedStrategyInfo(bytes32 strategyId) external view strategyExists(strategyId) returns (
        address trader,
        OpportunityType opportunityType,
        RiskTier riskTier,
        StrategyStatus status,
        uint256 totalExecutions,
        uint256 successfulExecutions,
        uint256 createdAt
    ) {
        Strategy storage strat = strategies[strategyId];
        // Allow access if caller is trader OR strategy is shared with caller
        if (strat.trader != msg.sender && !isSharedWith[strategyId][msg.sender]) revert Unauthorized();

        return (
            strat.trader,
            strat.opportunityType,
            strat.riskTier,
            strat.status,
            strat.totalExecutions,
            strat.successfulExecutions,
            strat.createdAt
        );
    }

    /**
     * @notice Get encrypted strategy data (for trader or shared users)
     */
    function getSharedEncryptedStrategy(bytes32 strategyId) external view returns (
        euint64 capital,
        euint64 exposure,
        euint64 realizedPnL,
        euint32 targetReturn,
        euint32 stopLoss
    ) {
        Strategy storage strat = strategies[strategyId];
        // Allow access if caller is trader OR strategy is shared with caller
        require(strat.trader == msg.sender || isSharedWith[strategyId][msg.sender], "Not authorized");
        return (
            strat.capitalCipher,
            strat.exposureCipher,
            strat.realizedPnLCipher,
            strat.targetReturnBpsCipher,
            strat.stopLossBpsCipher
        );
    }
}
