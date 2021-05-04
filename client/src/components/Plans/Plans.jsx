import React, { useEffect, useState } from "react";

function Plans({ writeContracts }) {
  const [plans, setPlans] = useState([]);

  useEffect(async () => {
    try {
      const plansCount = await writeContracts.SafexMain.plansCount();

      let allPlans = [];
      for (let i = 1; i <= plansCount; i++) {
        const plan = await writeContracts.SafexMain.plans(i);
        allPlans.push(plan);
      }
      setPlans(allPlans);
    } catch (e) {
      console.log(e);
    }
  }, [writeContracts]);

  return (
    <div>
      <h3>Plans</h3>
      {plans.forEach((plan) => console.log(plan))}
    </div>
  );
}

export default Plans;
