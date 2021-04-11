import React, { Component } from "react";

export default class Claims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myClaims: [],
    };
  }

  componentDidMount = async () => {
    console.log(this.props.claims);
    // const myClaims = this.props.claims.filter((claim) => claim.planCurrentOwner === this.props.accountAddress);
    // this.setState({ myClaims });
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
            <div id="collapse1" className="collapse show">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <p>Plan Id :</p>
                    <h5>1</h5>
                  </div>
                  <div className="col-6">
                    <p>Dispute Id :</p>
                    <h5>0</h5>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="row">
                  <div className="col-6">
                    <p>Metaevidence Id :</p>
                    <h5>1</h5>
                  </div>
                  <div className="col-6">
                    <p>Evidence Group Id :</p>
                    <h5>1</h5>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="row">
                  <div className="col-6">
                    <p>Status :</p>
                    <h5>1</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-secondary">
            <h5 className="card-header bg-primary">
              <a
                href="#collapse2"
                data-parent="#accordion"
                data-toggle="collapse"
                className="text-decoration-none text-white"
              >
                All Claims
              </a>
            </h5>
            <div id="collapse2" className="collapse show">
              <table className="table table-hover text-center">
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
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>Claimed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
