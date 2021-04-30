const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("SafexMain", async () => {
  let autoAppealableArbitrator, safexMain, safexMainAdminAndArbitrator, planCreator, inheritor, accountX;

  describe("SafexMain Flow", async () => {
    it("Should deploy SafexMain", async () => {
      [safexMainAdminAndArbitrator, planCreator, inheritor, accountX] = await ethers.getSigners();

      const AutoAppealableArbitrator = await ethers.getContractFactory("AutoAppealableArbitrator");
      autoAppealableArbitrator = await AutoAppealableArbitrator.deploy(ethers.utils.parseEther("0.001"));
      await autoAppealableArbitrator.deployed();

      const SafexMain = await ethers.getContractFactory("SafexMain");
      safexMain = await SafexMain.deploy(autoAppealableArbitrator.address);
      await safexMain.deployed();

      expect(await safexMain.arbitrator()).to.equal(autoAppealableArbitrator.address);
      expect(await autoAppealableArbitrator.arbitrationCost(123)).to.equal(ethers.utils.parseEther("0.001"));
    });

    it("Should allow users to create a plan", async () => {
      const arbitrationFee = await autoAppealableArbitrator.arbitrationCost(123); // 0.001 eth

      // SUCCESS : create a plan
      await safexMain
        .connect(planCreator)
        .createPlan(
          inheritor.address,
          "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/",
          {
            value: arbitrationFee.toNumber() + ethers.utils.parseEther("0.001").toNumber(),
          }
        );

      expect(await safexMain.plansCount()).to.equal(1);
      expect(await safexMain.getSafexMainContractBalance()).to.equal(ethers.utils.parseEther("0.002")); // 0.002 eth

      const plan = await safexMain.plans(1);

      expect(plan.planCreatedBy).to.equal(planCreator.address);
      expect(plan.planInheritor).to.equal(inheritor.address);
      expect(plan.planFunds).to.equal(ethers.utils.parseEther("0.002")); // 0.002 eth

      // FAILURE : paying inadequate or no fee(arbitration fee) for plan creation
      await expect(
        safexMain
          .connect(planCreator)
          .createPlan(
            inheritor.address,
            "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/",
            {
              value: arbitrationFee.toNumber() - ethers.utils.parseEther("0.001").toNumber(),
            }
          )
      ).to.be.revertedWith("Inadequate fee payment");

      // FAILURE : metaEvidence is not passed
      await expect(
        safexMain.connect(planCreator).createPlan(inheritor.address, "", {
          value: arbitrationFee.toNumber(),
        })
      ).to.be.revertedWith("Should provide metaEvidence to create a plan");

      // FAILURE : inheritor is an zero address
      await expect(
        safexMain
          .connect(planCreator)
          .createPlan(
            "0x0000000000000000000000000000000000000000",
            "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/",
            {
              value: arbitrationFee.toNumber(),
            }
          )
      ).to.be.revertedWith("Should provide an inheritor for the plan");

      // FAILURE : plan creator and inheritor are same
      await expect(
        safexMain
          .connect(planCreator)
          .createPlan(
            planCreator.address,
            "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/",
            {
              value: arbitrationFee.toNumber(),
            }
          )
      ).to.be.revertedWith("Plan creator should not be the inheritor of the plan");
    });

    it("Should allow inheritors to create a claim", async () => {
      // FAILURE : plan does not exist
      await expect(
        safexMain
          .connect(inheritor)
          .createClaim(4, "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/")
      ).to.be.revertedWith("Plan does not exist");

      // FAILURE : only inheritor of the plan can create the claim
      await expect(
        safexMain
          .connect(accountX)
          .createClaim(1, "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/")
      ).to.be.revertedWith("Only inheritor of the plan can create the claim");

      // SUCCESS : create 1st claim
      await safexMain
        .connect(inheritor)
        .createClaim(1, "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/"); // evidence

      expect(await safexMain.getSafexMainContractBalance()).to.equal(ethers.utils.parseEther("0.001")); // 0.001 eth

      let plan;
      plan = await safexMain.plans(1);

      expect(plan.planFunds).to.equal(ethers.utils.parseEther("0.001")); // 0.001 eth
      expect(plan.claimsCount).to.equal(1);

      const claim1 = await safexMain.claims(0);

      expect(claim1.disputeId).to.equal(0);
      expect(claim1.claimedBy).to.equal(inheritor.address);
      expect(claim1.result).to.equal("Active");

      // SUCCESS : create 2nd claim on the same plan
      await safexMain
        .connect(inheritor)
        .createClaim(1, "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/"); // evidence

      expect(await safexMain.getSafexMainContractBalance()).to.equal(0); // 0 eth

      plan = await safexMain.plans(1);

      expect(plan.planFunds).to.equal(0); // 0 eth
      expect(plan.claimsCount).to.equal(2);

      const claim2 = await safexMain.claims(1);

      expect(claim2.disputeId).to.equal(1);
      expect(claim2.claimedBy).to.equal(inheritor.address);
      expect(claim2.result).to.equal("Active");

      // FAILURE : total number of claims on a plan has reached the limit
      await expect(
        safexMain
          .connect(inheritor)
          .createClaim(1, "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/")
      ).to.be.revertedWith("Total number of claims on a plan has reached the limit");

      // FAILURE : insufficient funds in the plan to pay the arbitration fee
      await expect(
        safexMain
          .connect(inheritor)
          .createClaim(1, "https://bafybeif52vrffdp7m2ip5f44ox552r7p477druj2w4g3r47wpuzdn7235y.ipfs.infura-ipfs.io/")
      ).to.be.reverted;
    });

    it("Should allow arbitrator to give ruling on a claim", async () => {
      // FAILURE : invalid ruling (only 2 options are available, but giving 3rd option as a ruling is invalid) - as per autoAppealableArbitrator
      await expect(autoAppealableArbitrator.connect(safexMainAdminAndArbitrator).giveRuling(0, 3)).to.be.revertedWith(
        "Invalid ruling"
      );

      // FAILURE : can only be called by the owner - as per autoAppealableArbitrator
      await expect(autoAppealableArbitrator.connect(accountX).giveRuling(0, 2)).to.be.revertedWith(
        "Can only be called by the owner"
      );

      // SUCCESS : give a ruling to claim1
      await autoAppealableArbitrator.connect(safexMainAdminAndArbitrator).giveRuling(0, 2);

      const claim1 = await safexMain.claims(0);

      expect(claim1.result).to.equal("Failed"); // Failed

      // SUCCESS : give a ruling to claim2
      await autoAppealableArbitrator.connect(safexMainAdminAndArbitrator).giveRuling(1, 0);

      const claim2 = await safexMain.claims(1);

      expect(claim2.result).to.equal("RTA"); // Refused To Arbitrate (RTA)
    });

    it("Should allow users to deposit funds in a plan", async () => {
      // FAILURE : plan does not exist
      await expect(
        safexMain.connect(accountX).depositPlanFunds(4, { value: ethers.utils.parseEther("2") }) // 2 eth
      ).to.be.revertedWith("Plan does not exist");

      // SUCCESS : deposit funds in a plan
      await safexMain.connect(accountX).depositPlanFunds(1, { value: ethers.utils.parseEther("2") }); // 2 eth

      expect(await safexMain.getSafexMainContractBalance()).to.equal(ethers.utils.parseEther("2")); // 2 eth
    });

    it("Should allow the plan owner to recover funds in the plan", async () => {
      // FAILURE : plan does not exist
      await expect(safexMain.connect(planCreator).recoverPlanFunds(4)).to.be.revertedWith("Plan does not exist");

      // FAILURE : only plan owner can recover the funds
      await expect(safexMain.connect(accountX).recoverPlanFunds(1)).to.be.revertedWith(
        "Only plan owner can recover the deposit balance"
      );

      // SUCCESS : recover funds from a plan
      await safexMain.connect(planCreator).recoverPlanFunds(1);

      expect(await safexMain.getSafexMainContractBalance()).to.equal(0); // 0 eth

      // FAILURE : no funds remaining in the plan
      await expect(safexMain.connect(planCreator).recoverPlanFunds(1)).to.be.revertedWith(
        "No funds remaining in the plan"
      );
    });

    it("Should allow it's admin to set the total number of claims allowed on a plan", async () => {
      // FAILURE : only SafexMain contract's admin can execute this
      await expect(safexMain.connect(accountX).setTotalClaimsAllowed(3)).to.be.revertedWith(
        "Only SafexMain contract's admin can execute this"
      );

      // SUCCESS : set new total number of claims allowed
      await safexMain.connect(safexMainAdminAndArbitrator).setTotalClaimsAllowed(4);

      expect(await safexMain.getTotalClaimsAllowed()).to.equal(4);
    });
  });
});
