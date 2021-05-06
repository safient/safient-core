import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import { Text, Divider, Spacer, Snippet, useToasts } from "@geist-ui/react";

function SafexMainDetails({ writeContracts }) {
  const [arbitratorContractAddress, setArbitratorContractAddress] = useState("");
  const [safexMainContractAddress, setSafexMainContractAddress] = useState("");
  const [safexMainBalance, setSafexMainBalance] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [claimsCount, setClaimsCount] = useState(0);
  const [claimsAllowed, setClaimsAllowed] = useState(0);
  const [toasts, setToast] = useToasts();

  const showAlert = (alertMessage, alertColor) => {
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  useEffect(async () => {
    try {
      setArbitratorContractAddress(writeContracts.AutoAppealableArbitrator.address);
      setSafexMainContractAddress(writeContracts.SafexMain.address);
      const balance = await writeContracts.SafexMain.getSafexMainContractBalance();
      setSafexMainBalance(utils.formatEther(balance));
      const plansCount = await writeContracts.SafexMain.plansCount();
      setPlansCount(Number(plansCount));
      const claimsCount = await writeContracts.SafexMain.claimsCount();
      setClaimsCount(Number(claimsCount));
      const claimsAllowed = await writeContracts.SafexMain.getTotalClaimsAllowed();
      setClaimsAllowed(Number(claimsAllowed));
    } catch (e) {
      if (e.data !== undefined) {
        const error = e.data.message.split(":")[2].split("revert ")[1];
        showAlert(error + "!", "warning");
      } else {
        console.log(e);
      }
    }
  }, [writeContracts]);

  return (
    <>
      <Text b>Arbitrator contract :</Text>
      <Spacer />
      <Snippet text={arbitratorContractAddress} type="lite" filled symbol="" width="390px" />
      <Divider />
      <Text b>SafexMain contract :</Text>
      <Spacer />
      <Snippet text={safexMainContractAddress} type="lite" filled symbol="" width="390px" />
      <Divider />
      <Text b>SafexMain balance :</Text>
      <Text>
        {safexMainBalance}
        <Spacer inline x={0.35} />
        ETH
      </Text>
      <Divider />
      <Text b>Total no. of plans :</Text>
      <Text>{plansCount}</Text>
      <Divider />
      <Text b>Total no. of claims :</Text>
      <Text>{claimsCount}</Text>
      <Divider />
      <Text b>Total no. of claims allowed :</Text>
      <Text>{claimsAllowed}</Text>
    </>
  );
}

export default SafexMainDetails;
