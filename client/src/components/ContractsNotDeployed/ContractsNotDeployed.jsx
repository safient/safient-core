import React from "react";

const ContractsNotDeployed = () => {
  return (
    <div className="jumbotron">
      <h4 style={{ textTransform: "none", fontWeight: "normal" }}>
        SafexMain or AutoAppealableArbitrator Contract Not Deployed To This Network.
      </h4>
      <hr className="my-4" />
      <p className="lead">Connect Metamask to Ropsten Testnet.</p>
    </div>
  );
};

export default ContractsNotDeployed;
