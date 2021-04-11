import React from "react";

export default function MyAccount({ accountAddress, accountBalance }) {
  return (
    <div className="p-4 pt-4">
      <p className="lead">Account address :</p>
      <h5>{accountAddress}</h5>
      <hr className="my-4" />
      <p className="lead">Account balance :</p>
      <h5>{accountBalance} ETH</h5>
    </div>
  );
}
