import React, { Component } from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";
import Archon from "@kleros/archon";
import ipfsPublish from "../../IPFS/ipfsPublish";

const web3 = new Web3();

// const archon = new Archon("https://ropsten.infura.io/v3/2138913d0e324125bf671fafd93e186c", "https://ipfs.kleros.io");
const archon = new Archon("http://127.0.0.1:7545");

export default class CreatePlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inheritorAddress: "",
      arbitrationFeeWei: "",
      arbitrationFeeEth: "",
      extraFeeEth: "",
      safexAgreementLink:
        "https://ipfs.kleros.io/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png",
      safexAgreementURI: "/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png",
      buffer: null,
      userHasCreatedPlan: false,
    };
    this.encoder = new TextEncoder();
  }

  componentDidMount = async () => {
    const arbitrationFeeWei = await archon.arbitrator.getArbitrationCost(this.props.arbitratorContractAddress);
    this.setState({ arbitrationFeeWei });
    const arbitrationFeeEth = web3.utils.fromWei(arbitrationFeeWei, "ether");
    this.setState({ arbitrationFeeEth });
    const userHasCreatedPlan = await this.props.safexMainContract.methods
      .hasCreatedPlan(this.props.accountAddress)
      .call();
    this.setState({ userHasCreatedPlan });
  };

  onFormSubmit = async (e) => {
    e.preventDefault();
    let totalPrice;
    if (this.state.extraFeeEth !== 0 && this.state.extraFeeEth !== "" && this.state.extraFeeEth !== null) {
      this.props.setLoadingToTrue();
      const extraFeeWei = web3.utils.toWei(this.state.extraFeeEth, "ether");
      const totalFunds = (Number(this.state.arbitrationFeeWei) + Number(extraFeeWei)).toString();
      totalPrice = totalFunds;
    } else {
      this.props.setLoadingToTrue();
      totalPrice = this.state.arbitrationFeeWei;
    }
    const metaevidenceObj = {
      fileURI: this.state.safexAgreementURI,
      fileHash: "QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13",
      fileTypeExtension: "png",
      category: "Safex Claims",
      title: "Provide a convenient and safe way to propose and claim the inheritance and safekeeping mechanism",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      aliases: {
        [this.props.safexMainContractAddress]: "SafexMain",
        [this.props.accountAddress]: [this.props.accountAddress],
      },
      question: "Does the claimer qualify for inheritence?",
      rulingOptions: {
        type: "single-select",
        titles: ["Yes", "No"],
        descriptions: ["The claimer is qualified for inheritence", "The claimer is not qualified for inheritence"],
      },
    };
    const cid = await ipfsPublish("metaEvidence.json", this.encoder.encode(JSON.stringify(metaevidenceObj)));
    const metaevidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;
    // const metaEvidence = `https://ipfs.kleros.io${metaevidenceURI}`;
    this.props.createPlan(this.state.inheritorAddress, metaevidenceURI, totalPrice);
  };

  render() {
    return (
      <div className="p-4 pt-4">
        {!this.state.userHasCreatedPlan ? (
          <>
            <p className="lead">Required Minimum Funds To Create A Plan :</p>
            <h5 className="text-capitalize">
              {this.state.arbitrationFeeEth} ETH <small>(Current Arbitration Fee)</small>
            </h5>
            <p>
              Arbitration fee (subject to change in the future) is collected and stored in the plan. It can be used by
              the inheritor to create a claim. Owner of the plan can recover funds in the plan at anytime{" "}
              <Link to="/funds">
                <a className="font-weight-bold">
                  <u>here</u>
                </a>
              </Link>
              .
            </p>
            <hr className="my-4" />
            <p className="lead">Safex Agreement :</p>
            <h5 className="text-lowercase">
              <a href={this.state.safexAgreementLink} target="_blank">
                Click Here 📎
              </a>
            </h5>
            <hr className="my-4" />
            <p className="lead">Create Plan :</p>
            <form onSubmit={this.onFormSubmit}>
              <div className="form-group mb-4 mt-4">
                <h5 className="text-capitalize">Inheritor address :</h5>
                <input
                  type="text"
                  className="form-control border border-primary"
                  required
                  style={{ width: "27%" }}
                  value={this.state.inheritorAddress}
                  onChange={(e) => this.setState({ inheritorAddress: e.target.value })}
                />
              </div>
              <div className="form-group mb-4">
                <h5 className="text-capitalize">
                  Add Extra Funds <small>(Optional)</small> :
                </h5>
                <input
                  type="number"
                  className="form-control border border-primary"
                  style={{ width: "27%" }}
                  value={this.state.extraFeeEth}
                  onChange={(e) => this.setState({ extraFeeEth: e.target.value })}
                />
              </div>
              <div>
                <button type="submit" className="btn btn-primary">
                  Create Plan
                </button>
              </div>
            </form>
          </>
        ) : (
          <div>
            <p className="lead">
              You have already created a plan, you can view it{" "}
              <Link to="/plans">
                <a className="font-weight-bold">
                  <u>here</u>
                </a>
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    );
  }
}
