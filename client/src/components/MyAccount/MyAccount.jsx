import React from "react";
import { utils } from "ethers";
import { Text, Divider, Spacer, Snippet } from "@geist-ui/react";

function MyAccount({ address, balance }) {
  return (
    <>
      <Text b>Account address :</Text>
      <Spacer />
      <Snippet text={address} type="lite" filled symbol="" width="390px" />
      <Divider />
      <Text b>Account balance :</Text>
      <Text>
        {utils.formatEther(balance)}
        <Spacer inline x={0.35} />
        ETH
      </Text>
    </>
  );
}

export default MyAccount;
