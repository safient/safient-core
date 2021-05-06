import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import ipfsPublish from "../../ipfs/ipfsPublish";
import Archon from "@kleros/archon";
import { Divider, Spacer, Text, Link, Note, Input, Button, useToasts } from "@geist-ui/react";
import { ExternalLink } from "@geist-ui/react-icons";

function CreatePlan({ network, address, writeContracts }) {
  const [safexMainContractAddress, setSafexMainContractAddress] = useState("");
  const [inheritorAddress, setInheritorAddress] = useState("");
  const [arbitrationFeeWei, setArbitrationFeeWei] = useState("");
  const [arbitrationFeeEth, setArbitrationFeeEth] = useState("");
  const [extraFeeEth, setExtraFeeEth] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToast] = useToasts();

  const encoder = new TextEncoder();
  const safexAgreementLink =
    "https://ipfs.kleros.io/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png";
  const safexAgreementURI = "/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png";

  const showAlert = (alertMessage, alertColor) => {
    setLoading(false);
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  let archon;
  if (network === "localhost") {
    archon = new Archon("http://127.0.0.1:8545");
  } else {
    archon = new Archon(`https://${network}.infura.io/v3/2138913d0e324125bf671fafd93e186c`, "https://ipfs.kleros.io");
  }

  useEffect(async () => {
    try {
      setSafexMainContractAddress(writeContracts.SafexMain.address);
      const arbitrationFeeWei = await archon.arbitrator.getArbitrationCost(
        writeContracts.AutoAppealableArbitrator.address
      );
      setArbitrationFeeWei(arbitrationFeeWei);
      setArbitrationFeeEth(utils.formatEther(arbitrationFeeWei));
    } catch (e) {
      showAlert("Error!", "warning");
    }
  }, [writeContracts]);

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (inheritorAddress !== "" && inheritorAddress.length === 42) {
      setLoading(true);
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
      try {
        const tx = await writeContracts.SafexMain.createPlan(inheritorAddress, metaevidenceURI, { value: totalPrice });
        const txReceipt = await tx.wait();
        if (txReceipt.status === 1) {
          showAlert("Transaction successful!", "success");
        } else if (txReceipt.status === 0) {
          showAlert("Transaction rejected!", "warning");
        }
      } catch (e) {
        if (e.data !== undefined) {
          const error = e.data.message.split(":")[2].split("revert ")[1];
          showAlert(error + "!", "warning");
        } else {
          showAlert("Error!", "warning");
        }
      }
    } else {
      showAlert("Enter a valid inheritor address!", "warning");
    }
  };

  return (
    <>
      <Note label="Note ">
        Minimum funds required is the current arbitration fee (subject to change in the future) that is collected and
        stored in the plan. It can be used by the inheritor to create a claim. Owner of the plan can recover funds in
        the plan at anytime.
      </Note>
      <Spacer />
      <Link target="_blank" href={safexAgreementLink} style={{ display: "flex", alignItems: "flex-start" }}>
        <Text b>Safex Plan Agreement</Text>
        <Spacer inline x={0.35} />
        <ExternalLink size={20} />
      </Link>
      <Divider />
      <form>
        <Input readOnly status="secondary" placeholder={`${arbitrationFeeEth} ETH`} width="50%">
          <Text b>Minimum Funds Required :</Text>
        </Input>
        <Spacer />
        <Input status="secondary" clearable onChange={(e) => setInheritorAddress(e.target.value)} width="50%">
          <Text b>Inheritor Address :</Text>
        </Input>
        <Spacer />
        <Input status="secondary" type="number" onChange={(e) => setExtraFeeEth(e.target.value)} width="50%">
          <Text b>
            Extra Funds <Text small>(optional)</Text> :
          </Text>
        </Input>
        <Spacer y={2} />
        {!loading ? (
          <Button type="secondary" auto onClick={onFormSubmit}>
            Create Plan
          </Button>
        ) : (
          <Button type="secondary" auto loading>
            Create Plan
          </Button>
        )}
      </form>
    </>
  );
}

export default CreatePlan;
