import React, { useEffect, useState } from "react";
import { utils } from "ethers";

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
    <div>
      <h3>SafexMain Details</h3>
      <h4>{arbitratorContractAddress}</h4>
      <h4>{safexMainContractAddress}</h4>
      <h4>{safexMainBalance} ETH</h4>
      <h4>{plansCount}</h4>
      <h4>{claimsCount}</h4>
      <h4>{claimsAllowed}</h4>
    </div>
  );
}

export default SafexMainDetails;
