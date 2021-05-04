import React, { useEffect, useState } from "react";
import { utils } from "ethers";

function MyAccount({ address, balance }) {
  return (
    <div>
      <h3>My Account</h3>
      <h4>{address}</h4>
      <h4>{utils.formatEther(balance)} ETH</h4>
    </div>
  );
}

export default MyAccount;
