import React from "react";
import { HoneybadgerErrorBoundary } from "@honeybadger-io/react";
import honeybadger from "./honeybadger";

const ErrorFallback = () => (
  <div className="d-flex justify-content-center my-4">
    <div className="card text-center" style={{ maxWidth: "400px" }}>
      <div className="card-body">
        <img
          src="/images/capybara/capybara_square,w_200.png"
          alt=""
          style={{ width: "80px", height: "auto" }}
          className="mb-3"
        />
        <h5 className="card-title">Something went wrong</h5>
        <p className="card-text text-muted">
          An unexpected error occurred. Please try reloading the page.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    </div>
  </div>
);

export const ErrorBoundary = ({ children }) => (
  <HoneybadgerErrorBoundary honeybadger={honeybadger} ErrorComponent={ErrorFallback}>
    {children}
  </HoneybadgerErrorBoundary>
);
