import React, { useEffect, useState } from "react";
import { useToasts, Table, Tag } from "@geist-ui/react";

function Claims({ writeContracts }) {
  const [claims, setClaims] = useState([]);
  const [data, setData] = useState([]);
  const [toasts, setToast] = useToasts();

  const showAlert = (alertMessage, alertColor) => {
    setToast({
      text: alertMessage,
      type: alertColor,
    });
  };

  useEffect(async () => {
    try {
      const claimsCount = await writeContracts.SafexMain.claimsCount();
      let allClaims = [];
      for (let i = 0; i < claimsCount; i++) {
        const claim = await writeContracts.SafexMain.claims(i);
        allClaims.push(claim);
      }
      setClaims(allClaims);
    } catch (e) {
      if (e.data !== undefined) {
        const error = e.data.message.split(":")[2].split("revert ")[1];
        showAlert(error + "!", "warning");
      } else {
        showAlert("Error!", "warning");
      }
    }
  }, [writeContracts]);

  useEffect(() => {
    let newData = [];
    claims.map((claim) => {
      const dataItem = {
        planId: String(claim.planId),
        disputeId: String(claim.disputeId),
        claimedBy: claim.claimedBy.substr(0, 5) + "..." + claim.claimedBy.slice(claim.claimedBy.length - 5),
        result:
          (claim.result === "Active" && (
            <Tag type="secondary" invert>
              Active
            </Tag>
          )) ||
          (claim.result === "Passed" && (
            <Tag type="success" invert>
              Passed
            </Tag>
          )) ||
          (claim.result === "Failed" && (
            <Tag type="error" invert>
              Failed
            </Tag>
          )),
      };
      newData.push(dataItem);
    });
    setData(newData);
  }, [claims]);

  return (
    <>
      <Table data={data}>
        <Table.Column prop="planId" label="Plan Id" />
        <Table.Column prop="disputeId" label="Dispute Id" />
        <Table.Column prop="claimedBy" label="Claimed By" />
        <Table.Column prop="result" label="Status" />
      </Table>
    </>
  );
}

export default Claims;
