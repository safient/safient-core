import React, { Component } from "react";
import ipfsPublish from "../../IPFS/ipfsPublish";

export default class SubmitEvidence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disputeId: "",
      buffer: null,
      fileName: "",
      fileExtension: "",
      evidenceName: "",
      evidenceDescription: "",
    };
    this.encoder = new TextEncoder();
  }

  onFormSubmit = async (e) => {
    e.preventDefault();
    if (this.state.disputeId !== "" && this.state.disputeId !== null && Number(this.state.disputeId) >= 0) {
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
      this.props.submitEvidence(Number(this.state.disputeId), evidenceURI);
    } else {
      alert("Enter valid dispute id.");
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
        <p className="lead">Submit Evidence For Claims :</p>
        <form onSubmit={this.onFormSubmit}>
          <div className="form-group mb-4 mt-4">
            <h5 className="text-capitalize">Dispute Id :</h5>
            <input
              type="number"
              className="form-control border border-primary"
              style={{ width: "27%" }}
              value={this.state.disputeId}
              onChange={(e) => this.setState({ disputeId: e.target.value })}
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
              Submit Evidence
            </button>
          </div>
        </form>
      </div>
    );
  }
}
