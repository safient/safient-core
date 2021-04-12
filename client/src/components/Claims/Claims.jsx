import React, { Component } from "react";

export default class Claims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myClaims: [],
    };
  }

  componentDidMount = async () => {
    const myClaims = this.props.claims.filter((claim) => claim.claimedBy === this.props.accountAddress);
    this.setState({ myClaims });
  };

  render() {
    return (
      <div className="pt-4">
        <div className="accordion">
          <div className="card bg-secondary">
            <h5 className="card-header bg-dark">
              <a
                href="#collapse1"
                data-parent="#accordion"
                data-toggle="collapse"
                className="text-decoration-none text-white"
              >
                My Claim
              </a>
            </h5>
            <div id="collapse1" className="collapse">
              {this.state.myClaims.length !== 0 ? (
                <>
                  {this.state.myClaims.map((claim) => {
                    return (
                      <div className="card-body">
                        <div className="row">
                          <div className="col-6">
                            <p>Plan Id :</p>
                            <h5>{claim.planId}</h5>
                          </div>
                          <div className="col-6">
                            <p>Claimed By :</p>
                            <h5>{claim.claimedBy}</h5>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <div className="row">
                          <div className="col-6">
                            <p>Dispute Id :</p>
                            <h5>{claim.disputeId}</h5>
                          </div>
                          <div className="col-6">
                            <p>Metaevidence Id :</p>
                            <h5>{claim.metaEvidenceId}</h5>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <div className="row">
                          <div className="col-6">
                            <p>Evidence Group Id :</p>
                            <h5>{claim.evidenceGroupId}</h5>
                          </div>
                          <div className="col-6">
                            <p>Status :</p>
                            <h5
                              className={
                                (claim.result === "Active" && "bg-warning") ||
                                (claim.result === "Passed" && "bg-success") ||
                                (claim.result === "Failed" && "bg-danger")
                              }
                              style={{ width: "max-content", color: "#fff", padding: "0.6rem 1rem" }}
                            >
                              {claim.result}
                            </h5>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="pl-3 pt-3">
                  <p className="lead">You don't have any active claims</p>
                </div>
              )}
            </div>
          </div>
          <div className="card bg-secondary">
            <h5 className="card-header bg-dark">
              <a
                href="#collapse2"
                data-parent="#accordion"
                data-toggle="collapse"
                className="text-decoration-none text-white"
              >
                All Claims
              </a>
            </h5>
            <div id="collapse2" className="collapse">
              {this.props.claims.length !== 0 ? (
                <table className="table text-center">
                  <thead>
                    <tr>
                      <th scope="col">Plan Id</th>
                      <th scope="col">Claimed By</th>
                      <th scope="col">Dispute Id</th>
                      <th scope="col">MetaEvidence Id</th>
                      <th scope="col">Evidence Group Id</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-weight-bold">
                    {this.props.claims.map((claim) => {
                      return (
                        <tr>
                          <th scope="row">{claim.planId}</th>
                          <td>
                            {claim.claimedBy.substr(0, 6) + "...." + claim.claimedBy.slice(claim.claimedBy.length - 6)}
                          </td>
                          <td>{claim.disputeId}</td>
                          <td>{claim.metaEvidenceId}</td>
                          <td>{claim.evidenceGroupId}</td>
                          <td
                            className={
                              (claim.result === "Active" && "bg-warning") ||
                              (claim.result === "Passed" && "bg-success") ||
                              (claim.result === "Failed" && "bg-danger")
                            }
                            style={{ color: "#fff", padding: "" }}
                          >
                            {claim.result}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="pl-3 pt-3">
                  <p className="lead">No claims have been created</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
