import React from "react";
import { NETWORK } from "../../constants.js";
import { Text } from "@geist-ui/react";

function ContractsNotDeployed({ localChainId, selectedChainId }) {
  return (
    <Text p>
      You are on <b>{NETWORK(selectedChainId).name}</b>, switch to <b>{NETWORK(localChainId).name}</b>.
    </Text>
  );
}

export default ContractsNotDeployed;
