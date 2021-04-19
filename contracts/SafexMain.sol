// SPDX-License-Identifier: MIT
pragma solidity >=0.7;

import "./IArbitrable.sol";
import "./IArbitrator.sol";
import "./IEvidence.sol";

contract SafexMain is IArbitrable, IEvidence {
    /* Constants and Immutable */
    uint256 private constant RULING_OPTIONS = 2;

    /* Enums */
    enum ClaimStatus {Active, Passed, Failed, Refused}

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
        uint256 planId;
        uint256 disputeId;
        address claimedBy;
        uint256 metaEvidenceId;
        uint256 evidenceGroupId;
        ClaimStatus status;
        string result;
    }

    /* Storage - Public */
    IArbitrator public arbitrator;

    address public safexMainAdmin;

    uint256 public plansCount = 0;
    uint256 public claimsCount = 0;
    uint256 public metaEvidenceID = 0;
    uint256 public evidenceGroupID = 0;

    mapping(uint256 => Plan) public plans; // plans[planId] => plan, starts from 1
    mapping(uint256 => Claim) public claims; // claims[disputeId] => claim, starts from 0 (because, disputeId starts from 0)

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

    modifier planShouldExist(uint256 _planId) {
        require(_planId <= plansCount, "Plan does not exist");
        _;
    }

    modifier shouldBeValidRuling(uint256 _ruling) {
        require(_ruling <= RULING_OPTIONS, "Ruling out of bounds!");
        _;
    }

    modifier planCreationRequisite(
        address _inheritor,
        string calldata _metaEvidence
    ) {
        require(
            msg.value >= arbitrator.arbitrationCost(""),
            "Inadequate fee payment"
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
        _;
    }

    modifier claimCreationRequisite(
        uint256 _planId,
        string calldata _evidence
    ) {
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
        _;
    }

    modifier recoverPlanFundsRequisite(uint256 _planId) {
        Plan memory plan = plans[_planId];

        require(
            msg.sender == plan.planCurrentOwner,
            "Only plan owner can recover the deposit balance"
        );
        require(plan.planFunds != 0, "No funds remaining in the plan");
        _;
    }

    modifier submitEvidenceRequisite(
        uint256 _disputeID,
        string calldata _evidence
    ) {
        require(_disputeID <= claimsCount, "Claim or Dispute does not exist");

        Claim memory claim = claims[_disputeID];

        require(
            msg.sender == claim.claimedBy,
            "Only creator of the claim can submit the evidence"
        );
        _;
    }

    /* Events */
    event CreatePlan(
        address indexed planCreatedBy,
        address indexed planInheritor,
        uint256 indexed metaEvidenceId
    );

    event CreateClaim(
        address indexed claimCreatedBy,
        uint256 indexed planId,
        uint256 indexed disputeId
    );

    /* Constructor */
    constructor(IArbitrator _arbitrator) {
        arbitrator = _arbitrator;
        safexMainAdmin = msg.sender;
    }

    /* Functions - External */
    receive() external payable {}

    function createPlan(address _inheritor, string calldata _metaEvidence)
        external
        payable
        planCreationRequisite(_inheritor, _metaEvidence)
    {
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
    }

    function createClaim(uint256 _planId, string calldata _evidence)
        external
        payable
        planShouldExist(_planId)
        claimCreationRequisite(_planId, _evidence)
    {
        Plan memory plan = plans[_planId];

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
            planId: _planId,
            disputeId: disputeID,
            claimedBy: msg.sender,
            metaEvidenceId: plan.metaEvidenceId,
            evidenceGroupId: evidenceGroupID,
            status: ClaimStatus.Active,
            result: "Active"
        });
        claims[disputeID] = claim;

        claimsCount += 1;

        emit CreateClaim(msg.sender, _planId, disputeID);

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
        shouldBeValidRuling(_ruling)
    {
        Claim memory claim = claims[_disputeID];

        if (_ruling == 1) {
            claim.status = ClaimStatus.Passed; // 1
            claim.result = "Passed";
        } else if (_ruling == 2) {
            claim.status = ClaimStatus.Failed; // 2
            claim.result = "Failed";
        } else if (_ruling == 0) {
            claim.status = ClaimStatus.Refused; // 3
            claim.result = "RTA"; // Refused To Arbitrate (RTA)
        }

        claims[_disputeID] = claim;

        emit Ruling(IArbitrator(msg.sender), _disputeID, _ruling);
    }

    function depositPlanFunds(uint256 _planId)
        external
        payable
        planShouldExist(_planId)
    {
        Plan memory plan = plans[_planId];
        plan.planFunds += msg.value;
        plans[_planId] = plan;

        (bool sent, bytes memory data) =
            address(this).call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    function recoverPlanFunds(uint256 _planId)
        external
        planShouldExist(_planId)
        recoverPlanFundsRequisite(_planId)
    {
        Plan memory plan = plans[_planId];

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
        submitEvidenceRequisite(_disputeID, _evidence)
    {
        Claim memory claim = claims[_disputeID];

        emit Evidence(arbitrator, claim.evidenceGroupId, msg.sender, _evidence);
    }

    /* Setters */
    function setTotalClaimsAllowed(uint256 _claimsAllowed)
        public
        onlySafexMainAdmin
    {
        _totalClaimsAllowed = _claimsAllowed;
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
