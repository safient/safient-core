import React from 'react';
import { NETWORK } from '../../networks';
import { Note } from '@geist-ui/react';

function ContractsNotDeployed({ localChainId, selectedChainId }) {
  return (
    <Note label='Note ' style={{ width: 'fit-content', marginTop: '1rem' }}>
      You are on <b>{NETWORK(selectedChainId).name}</b> network, switch to <b>{NETWORK(localChainId).name}</b> network.
    </Note>
  );
}

export default ContractsNotDeployed;
