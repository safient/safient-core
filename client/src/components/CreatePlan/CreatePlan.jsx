import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import Archon from "@kleros/archon";
import ipfsPublish from "../../ipfs/ipfsPublish";

// const archon = new Archon("https://ropsten.infura.io/v3/2138913d0e324125bf671fafd93e186c", "https://ipfs.kleros.io");
const archon = new Archon("http://127.0.0.1:8545");

function CreatePlan({ address, writeContracts }) {
  const [safexMainContractAddress, setSafexMainContractAddress] = useState("");
  const [inheritorAddress, setInheritorAddress] = useState("");
  const [arbitrationFeeWei, setArbitrationFeeWei] = useState("");
  const [arbitrationFeeEth, setArbitrationFeeEth] = useState("");
  const [extraFeeEth, setExtraFeeEth] = useState("");
  const [safexAgreementLink, setSafexAgreementLink] = useState(
    "https://ipfs.kleros.io/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png"
  );
  const [safexAgreementURI, setSafexAgreementURI] = useState(
    "/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png"
  );

  const encoder = new TextEncoder();

  useEffect(async () => {
    try {
      setSafexMainContractAddress(writeContracts.SafexMain.address);

      const arbitrationFeeWei = await archon.arbitrator.getArbitrationCost(
        writeContracts.AutoAppealableArbitrator.address
      );
      setArbitrationFeeWei(arbitrationFeeWei);

      setArbitrationFeeEth(utils.formatEther(arbitrationFeeWei));
    } catch (e) {
      console.log(e);
    }
  }, [writeContracts]);

  const onFormSubmit = async (e) => {
    e.preventDefault();

    let totalPrice;
    if (extraFeeEth !== 0 && extraFeeEth !== "" && extraFeeEth !== null) {
      const extraFeeWei = utils.parseEther(extraFeeEth);
      const totalFunds = (Number(arbitrationFeeWei) + Number(extraFeeWei)).toString();
      totalPrice = totalFunds;
    } else {
      totalPrice = arbitrationFeeWei;
    }

    const metaevidenceObj = {
      fileURI: safexAgreementURI,
      fileHash: "QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13",
      fileTypeExtension: "png",
      category: "Safex Claims",
      title: "Provide a convenient and safe way to propose and claim the inheritance and safekeeping mechanism",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      aliases: {
        [safexMainContractAddress]: "SafexMain",
        [address]: [address],
      },
      question: "Does the claimer qualify for inheritence?",
      rulingOptions: {
        type: "single-select",
        titles: ["Yes", "No"],
        descriptions: ["The claimer is qualified for inheritence", "The claimer is not qualified for inheritence"],
      },
    };

    const cid = await ipfsPublish("metaEvidence.json", encoder.encode(JSON.stringify(metaevidenceObj)));
    const metaevidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;
    writeContracts.SafexMain.createPlan(inheritorAddress, metaevidenceURI, { value: totalPrice });
  };

  return (
    <div>
      <h3>Create Plan</h3>
      <h4>Arbitration fee : {arbitrationFeeEth} ETH</h4>
      <form onSubmit={onFormSubmit}>
        <h5>Inheritor address</h5>
        <input type="text" required value={inheritorAddress} onChange={(e) => setInheritorAddress(e.target.value)} />
        <h5>
          Add Extra Funds <small>(Optional)</small> :
        </h5>
        <input type="number" value={extraFeeEth} onChange={(e) => setExtraFeeEth(e.target.value)} />
        <button type="submit">create plan</button>
      </form>
    </div>
  );
}

export default CreatePlan;
