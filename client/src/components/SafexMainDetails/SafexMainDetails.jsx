import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import { Description, Spacer, Snippet } from "@geist-ui/react";

function SafexMainDetails({ writeContracts }) {
  const [arbitratorContractAddress, setArbitratorContractAddress] = useState("");
  const [safexMainContractAddress, setSafexMainContractAddress] = useState("");
  const [safexMainBalance, setSafexMainBalance] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [claimsCount, setClaimsCount] = useState(0);
  const [claimsAllowed, setClaimsAllowed] = useState(0);

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
      console.log(e);
    }
  }, [writeContracts]);

  return (
    <>
      <Description
        title="Arbitrator contract"
        content={<Snippet text={arbitratorContractAddress} type="lite" filled symbol="" width="390px" />}
      />
      <Spacer y={2} />
      <Description
        title="SafexMain contract"
        content={<Snippet text={safexMainContractAddress} type="lite" filled symbol="" width="390px" />}
      />
      <Spacer y={2} />
      <Description title="SafexMain balance" content={`${safexMainBalance} ETH`} />
      <Spacer y={2} />
      <Description title="Total no. of plans" content={plansCount} />
      <Spacer y={2} />
      <Description title="Total no. of claims" content={claimsCount} />
      <Spacer y={2} />
      <Description title="Total no. of claims allowed" content={claimsAllowed} />
    </>
  );
}

export default SafexMainDetails;
