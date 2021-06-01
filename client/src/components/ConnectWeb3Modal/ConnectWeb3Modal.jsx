import React from 'react';
import { Button } from '@geist-ui/react';

export default function ConnectWeb3Modal({ web3Modal, loadWeb3Modal, logoutOfWeb3Modal }) {
  const modalButtons = [];

  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <Button type='secondary' auto key='logoutbutton' onClick={logoutOfWeb3Modal}>
          logout
        </Button>
      );
    } else {
      modalButtons.push(
        <Button type='secondary' auto key='loginbutton' onClick={loadWeb3Modal}>
          connect
        </Button>
      );
    }
  }

  return <>{modalButtons}</>;
}
