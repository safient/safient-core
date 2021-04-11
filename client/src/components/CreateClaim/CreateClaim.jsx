import React, { Component } from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";
import Archon from "@kleros/archon";
import ipfsPublish from "../../IPFS/ipfsPublish";

const web3 = new Web3();

// const archon = new Archon("https://ropsten.infura.io/v3/2138913d0e324125bf671fafd93e186c", "https://ipfs.kleros.io");
const archon = new Archon("http://127.0.0.1:7545");

export default class CreateClaim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      planId: "",
      buffer: null,
      fileName: "",
      fileExtension: "",
      evidenceName: "",
      evidenceDescription: "",
      arbitrationFeeEth: "",
    };
    this.encoder = new TextEncoder();
  }

  componentDidMount = async () => {
    const arbitrationFeeWei = await archon.arbitrator.getArbitrationCost(this.props.arbitratorContractAddress);
    const arbitrationFeeEth = web3.utils.fromWei(arbitrationFeeWei, "ether");
    this.setState({ arbitrationFeeEth });
  };

  onFormSubmit = async (e) => {
    e.preventDefault();
    if (
      this.state.planId !== "" &&
      this.state.planId !== null &&
      Number(this.state.planId) !== 0 &&
      Number(this.state.planId) > 0
    ) {
      this.props.setLoadingToTrue();
      const fileCid = await ipfsPublish(this.state.fileName, this.state.buffer);
      const fileURI = `/ipfs/${fileCid[1].hash}${fileCid[0].path}`;
      const evidenceObj = {
        fileURI,
        fileHash: fileCid[1].hash,
        fileTypeExtension: this.state.fileExtension,
        name: this.state.evidenceName,
        description: this.state.evidenceDescription,
      };
      const cid = await ipfsPublish("evidence.json", this.encoder.encode(JSON.stringify(evidenceObj)));
      const evidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;
      this.props.createClaim(Number(this.state.planId), evidenceURI);
    } else {
      alert("Enter valid plan id.");
    }
  };

  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    this.setState({ fileName: file.name });
    this.setState({ fileExtension: file.name.split(".")[1] });
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
    };
  };

  render() {
    return (
      <div className="p-4 pt-4">
        <p className="lead">Current Arbitration Fee :</p>
        <h5 className="text-capitalize">{this.state.arbitrationFeeEth} ETH</h5>
        <p>
          Make sure there is current arbitration fee worth of funds in the plan before trying to create a claim. If
          there isn't enough funds in the plan, you can top up funds of the plan you are trying to claim{" "}
          <Link to="/funds">
            <a className="font-weight-bold">
              <u>here</u>
            </a>
          </Link>
          .
        </p>
        <hr className="my-4" />
        <p className="lead">Create Claim :</p>
        <form onSubmit={this.onFormSubmit}>
          <div className="form-group mb-4 mt-4">
            <h5 className="text-capitalize">Plan Id :</h5>
            <input
              type="number"
              className="form-control border border-primary"
              style={{ width: "27%" }}
              value={this.state.planId}
              onChange={(e) => this.setState({ planId: e.target.value })}
            />
          </div>
          <div className="form-group mb-4">
            <h5 className="text-capitalize">Evidence Name :</h5>
            <input
              type="text"
              className="form-control border border-primary"
              style={{ width: "27%" }}
              value={this.state.evidenceName}
              onChange={(e) => this.setState({ evidenceName: e.target.value })}
            />
          </div>
          <div className="form-group mb-4">
            <h5 className="text-capitalize">Evidence Description :</h5>
            <textarea
              name="evidenceDescription"
              cols="30"
              rows="10"
              className="form-control border border-primary"
              value={this.state.evidenceDescription}
              onChange={(e) => this.setState({ evidenceDescription: e.target.value })}
            ></textarea>
          </div>
          <div className="form-group mb-4">
            <h5 className="text-capitalize">Upload Evidence :</h5>
            <input type="file" onChange={this.captureFile} className="form-control-file" />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              Create Claim
            </button>
          </div>
        </form>
      </div>
    );
  }
}
