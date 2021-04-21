import React from "react";
import metamaskIcon from "./metamask.svg";

const ConnectToMetamask = ({ connectToMetamask }) => {
  return (
    <div className="jumbotron">
      <h1 className="display-4" style={{ textTransform: "capitalize" }}>
        Safex Claims
      </h1>
      <p className="lead">
        An implementation of kleros arbitrable and evidence compatible contract to create and rule disputes.
      </p>
      <hr className="my-4" />
      <button
        onClick={connectToMetamask}
        className="btn btn-primary d-flex align-items-center"
        style={{ fontSize: "0.8rem", letterSpacing: "0.14rem", fontWeight: "normal" }}
      >
        Connect To Metamask{" "}
        <img src={metamaskIcon} alt="metamask-icon" style={{ width: "2rem", marginLeft: "0.5rem" }} />
      </button>
    </div>
  );
};

export default ConnectToMetamask;
