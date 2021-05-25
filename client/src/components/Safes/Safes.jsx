import React, { useEffect, useState } from 'react';
import { utils } from 'ethers';
import { useToasts, Table } from '@geist-ui/react';

function Safes({ writeContracts }) {
  const [safes, setSafes] = useState([]);
  const [data, setData] = useState([]);
  const [toasts, setToast] = useToasts();

  const showAlert = (alertMessage, alertColor) => {
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  useEffect(() => {
    async function init() {
      try {
        const safesCountArray = Array(Number(await writeContracts.SafexMain.safesCount())).fill(0);
        let safes = [];
        safesCountArray.forEach(async (_, i) => {
          const safe = await writeContracts.SafexMain.safes(i + 1);
          safes.push(safe);
          if (i === safesCountArray.length - 1) {
            setSafes(safes);
          }
        });
      } catch (e) {
        if (e.data !== undefined) {
          const error = e.data.message.split(':')[2].split('revert ')[1];
          showAlert(error + '!', 'warning');
        } else {
          showAlert('Error!', 'warning');
        }
      }
    }
    init();
  }, [writeContracts]);

  useEffect(() => {
    function init() {
      let newData = [];
      safes.map((safe) => {
        const dataItem = {
          safeId: String(safe.safeId),
          safeCreatedBy:
            safe.safeCreatedBy.substr(0, 5) + '...' + safe.safeCreatedBy.slice(safe.safeCreatedBy.length - 5),
          safeCurrentOwner:
            safe.safeCurrentOwner.substr(0, 5) + '...' + safe.safeCurrentOwner.slice(safe.safeCurrentOwner.length - 5),
          safeInheritor:
            safe.safeInheritor.substr(0, 5) + '...' + safe.safeInheritor.slice(safe.safeInheritor.length - 5),
          claimsCount: String(safe.claimsCount),
          safeFunds: utils.formatEther(safe.safeFunds) + ' ETH',
        };
        newData.push(dataItem);
      });
      setData(newData);
    }
    init();
  }, [safes]);

  return (
    <>
      <Table data={data}>
        <Table.Column prop='safeId' label='Safe Id' />
        <Table.Column prop='safeCreatedBy' label='Created By' />
        <Table.Column prop='safeCurrentOwner' label='Owned By' />
        <Table.Column prop='safeInheritor' label='Inheritor' />
        <Table.Column prop='claimsCount' label='Claims' />
        <Table.Column prop='safeFunds' label='Safe Funds' />
      </Table>
    </>
  );
}

export default Safes;
