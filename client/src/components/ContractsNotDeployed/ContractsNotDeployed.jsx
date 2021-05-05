import React from "react";
import { NETWORK } from "../../constants.js";
import { Note } from "@geist-ui/react";

function ContractsNotDeployed({ localChainId, selectedChainId }) {
  return (
    <Note label="Note " style={{ width: "34%", marginTop: "1rem" }}>
      You are on <b>{NETWORK(selectedChainId).name}</b>, switch to <b>{NETWORK(localChainId).name}</b>.
    </Note>
  );
}

export default ContractsNotDeployed;
