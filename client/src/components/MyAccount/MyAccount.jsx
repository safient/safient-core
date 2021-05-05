import React from "react";
import { utils } from "ethers";
import { Description, Spacer, Snippet } from "@geist-ui/react";

function MyAccount({ address, balance }) {
  return (
    <>
      <Description
        title="Account address"
        content={<Snippet text={address} type="lite" filled symbol="" width="390px" />}
      />
      <Spacer y={2} />
      <Description title="Account balance" content={`${utils.formatEther(balance)} ETH`} />
    </>
  );
}

export default MyAccount;
