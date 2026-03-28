import React, { useState } from "react";
import Jsona from "jsona";
import { postRequest } from "../../fetch";

const formatter = new Jsona();

const buttonStyle = { width: "2.5em", textAlign: "center" };

export const UsageButton = ({ used, id, onUsageRecorded }) => {
  const [loading, setLoading] = useState(false);

  if (used) {
    return (
      <div
        className="btn btn-secondary"
        style={buttonStyle}
        title="Already recorded usage for today"
      >
        <i className="fa fa-bookmark-o"></i>
      </div>
    );
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await postRequest(`/currently_inked/${id}/usage_record.json`);
      if (response.ok) {
        const json = await response.json();
        const entry = formatter.deserialize(json);
        if (onUsageRecorded) {
          onUsageRecorded(entry);
        }
      }
    } catch {
      // Network error — silently ignore, matching pattern from other components
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button className="btn btn-secondary" style={buttonStyle} title="Recording usage..." disabled>
        <i className="fa fa-spin fa-spinner"></i>
      </button>
    );
  }

  return (
    <button
      className="btn btn-secondary"
      style={buttonStyle}
      title="Record usage for today"
      onClick={handleClick}
    >
      <i className="fa fa-bookmark"></i>
    </button>
  );
};
