// SPDX-License-Identifier: MIT
pragma solidity >=0.7;

import "./IArbitrable.sol";
import "./IArbitrator.sol";
import "./IEvidence.sol";

contract SafexMain is IArbitrable, IEvidence {
    /* Constants and Immutable */
    uint256 private constant RULING_OPTIONS = 2;

    /* Enums */
    enum ClaimStatus {Active, Passed, Failed}

    enum ClaimResult {
        refusedToArbitrate,
        initiateReconstruction,
        doNotInitiateReconstruction
    }

    /* Structs */
    struct Plan {
        uint256 planId;
        address planCreatedBy;
        address planCurrentOwner;
        address planInheritor;
        uint256 metaEvidenceId;
        uint256 claimsCount;
        uint256 planFunds;
    }

    struct Claim {
        address claimedBy;
        uint256 disputeId;
        uint256 metaEvidenceId;
        uint256 evidenceGroupId;
        ClaimStatus status;
        string result;
    }

    /* Storage - Public */
    IArbitrator public arbitrator;

    address public safexMainAdmin = msg.sender;

    uint256 public plansCount = 0;
    uint256 public claimsCount = 0;
    uint256 public metaEvidenceID = 0;
    uint256 public evidenceGroupID = 0;

    mapping(uint256 => Plan) public plans; // starts from 1
    mapping(uint256 => Claim) public claims; // starts from 0 (because, disputeId starts from 0)
    mapping(uint256 => bool) public planExists;
    mapping(address => bool) public hasCreatedPlan;

    /* Storage - Private */
    uint256 private _totalClaimsAllowed = 2;

    /* Modifiers */
    modifier onlySafexMainAdmin {
        require(
            msg.sender == safexMainAdmin,
            "Only SafexMain contract's admin can execute this"
        );
        _;
    }

    modifier onlyArbitrator() {
        require(
            msg.sender == address(arbitrator),
            "Only arbitrator can execute this"
        );
        _;
    }

    /* Events */
    event CreatePlan(
        address indexed planCreatedBy,
        address indexed planInheritor,
        uint256 indexed metaEvidenceId
    );

    /* Constructor */
    constructor(IArbitrator _arbitrator) {
        arbitrator = _arbitrator;
    }

    /* Functions - External */
    receive() external payable {}

    function createPlan(address _inheritor, string calldata _metaEvidence)
        external
        payable
    {
        require(
            msg.value >= arbitrator.arbitrationCost(""),
            "Inadequate fee payment"
        );
        require(
            !hasCreatedPlan[msg.sender],
            "Sender has already created a plan"
        );
        require(
            bytes(_metaEvidence).length > 0,
            "Should provide metaEvidence to create a plan"
        );
        require(
            _inheritor != address(0),
            "Should provide an inheritor for the plan"
        );
        require(
            msg.sender != _inheritor,
            "Plan creator should not be the inheritor of the plan"
        );

        plansCount += 1;
        metaEvidenceID += 1;

        Plan memory plan = plans[plansCount];
        plan = Plan({
            planId: plansCount,
            planCreatedBy: msg.sender,
            planCurrentOwner: msg.sender,
            planInheritor: _inheritor,
            metaEvidenceId: metaEvidenceID,
            claimsCount: 0,
            planFunds: msg.value
        });
        plans[plansCount] = plan;

        (bool sent, bytes memory data) =
            address(this).call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit MetaEvidence(metaEvidenceID, _metaEvidence);
        emit CreatePlan(msg.sender, _inheritor, metaEvidenceID);

        hasCreatedPlan[msg.sender] = true;
        planExists[plansCount] = true;
    }

    function createClaim(uint256 _planId, string calldata _evidence)
        external
        payable
    {
        require(planExists[_planId], "Plan does not exist");

        Plan memory plan = plans[_planId];

        require(
            plan.claimsCount < _totalClaimsAllowed,
            "Total number of claims on a plan has reached the limit"
        );
        require(
            msg.sender == plan.planInheritor,
            "Only inheritor of the plan can create the claim"
        );
        require(
            plan.planFunds >= arbitrator.arbitrationCost(""),
            "Insufficient funds in the plan to pay the arbitration fee"
        );

        uint256 disputeID =
            arbitrator.createDispute{value: arbitrator.arbitrationCost("")}(
                RULING_OPTIONS,
                ""
            );

        evidenceGroupID += 1;

        emit Dispute(
            arbitrator,
            disputeID,
            plan.metaEvidenceId,
            evidenceGroupID
        );

        Claim memory claim = claims[disputeID];
        claim = Claim({
            claimedBy: msg.sender,
            disputeId: disputeID,
            metaEvidenceId: plan.metaEvidenceId,
            evidenceGroupId: evidenceGroupID,
            status: ClaimStatus.Active,
            result: ""
        });
        claims[disputeID] = claim;

        claimsCount += 1;

        plan.claimsCount += 1;
        plan.planFunds -= arbitrator.arbitrationCost("");
        plans[_planId] = plan;

        if (bytes(_evidence).length != 0) {
            submitEvidence(disputeID, _evidence);
        }
    }

    function rule(uint256 _disputeID, uint256 _ruling)
        external
        override
        onlyArbitrator
    {
        require(_ruling <= RULING_OPTIONS, "Ruling out of bounds!");

        Claim memory claim = claims[_disputeID];

        require(claim.status == ClaimStatus.Active, "Claim already resolved");

        if (_ruling == uint256(ClaimResult.initiateReconstruction)) {
            claim.status = ClaimStatus.Passed;
            claim.result = "Initiate reconstruction";
        } else if (
            _ruling == uint256(ClaimResult.doNotInitiateReconstruction)
        ) {
            claim.status = ClaimStatus.Failed;
            claim.result = "Do not initiate reconstruction";
        } else if (_ruling == uint256(ClaimResult.refusedToArbitrate)) {
            claim.result = "Refused to arbitrate";
        }

        claims[_disputeID] = claim;

        emit Ruling(IArbitrator(msg.sender), _disputeID, _ruling);
    }

    function depositPlanFunds(uint256 _planId) external payable {
        require(planExists[_planId], "Plan does not exist");

        Plan memory plan = plans[_planId];
        plan.planFunds += msg.value;
        plans[_planId] = plan;

        (bool sent, bytes memory data) =
            address(this).call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    function recoverPlanFunds(uint256 _planId) external {
        require(planExists[_planId], "Plan does not exist");

        Plan memory plan = plans[_planId];

        require(
            msg.sender == plan.planCurrentOwner,
            "Only plan owner can recover the deposit balance"
        );
        require(plan.planFunds != 0, "No funds remaining in the plan");

        uint256 blanceAmount = plan.planFunds;

        plan.planFunds = 0;
        plans[_planId] = plan;

        address _to = msg.sender;

        (bool sent, bytes memory data) = _to.call{value: blanceAmount}("");
        require(sent, "Failed to send Ether");
    }

    /* Functions - Public */
    function submitEvidence(uint256 _disputeID, string calldata _evidence)
        public
    {
        require(_disputeID <= claimsCount, "Claim or Dispute does not exist");

        Claim memory claim = claims[_disputeID];

        require(
            msg.sender == claim.claimedBy,
            "Only creator of the claim can submit the evidence"
        );

        emit Evidence(arbitrator, claim.evidenceGroupId, msg.sender, _evidence);
    }

    /* Setters */
    function setTotalClaimsAllowed(uint256 _newTotalClaimsAllowed)
        external
        onlySafexMainAdmin
    {
        _totalClaimsAllowed = _newTotalClaimsAllowed;
    }

    /* Getters */
    function getSafexMainContractBalance()
        public
        view
        returns (uint256 balance)
    {
        return address(this).balance;
    }

    function getTotalClaimsAllowed()
        public
        view
        returns (uint256 totalClaimsAllowed)
    {
        return _totalClaimsAllowed;
    }
}
