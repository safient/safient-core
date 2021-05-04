import React, { useEffect, useState } from "react";

function Claims({ writeContracts }) {
  const [claims, setClaims] = useState([]);

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
      console.log(e);
    }
  }, [writeContracts]);

  return (
    <div>
      <h3>Claims</h3>
      {claims.forEach((claim) => console.log(claim))}
    </div>
  );
}

export default Claims;
