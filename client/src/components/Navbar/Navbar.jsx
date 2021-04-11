import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <nav className="navbar navbar-expand-sm navbar-dark bg-primary">
          <div className="container">
            <Link
              to="/"
              className="navbar-brand ml-2"
              style={{ fontSize: "1rem", fontWeight: "normal", letterSpacing: "0.2rem" }}
            >
              Safex Main
            </Link>
            <button className="navbar-toggler" data-toggle="collapse" data-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div id="navbarNav" className="collapse navbar-collapse">
              <ul
                style={{ fontSize: "0.8rem", letterSpacing: "0.2rem", fontWeight: "normal" }}
                className="navbar-nav ml-auto"
              >
                <li className="nav-item">
                  <Link to="/my-account" className="nav-link">
                    My Account
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/create-plan" className="nav-link">
                    Create Plan
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/create-claim" className="nav-link">
                    Create Claim
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/my-plan" className="nav-link">
                    My Plan
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/my-claim" className="nav-link">
                    My Claim
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/all-plans" className="nav-link">
                    All Plans
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/all-claims" className="nav-link">
                    All Claims
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </>
    );
  }
}
