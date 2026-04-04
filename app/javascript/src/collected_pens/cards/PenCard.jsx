import React from "react";
import { CollectionEntryActions, pluralizedCountLabel } from "../../components";
import { Card } from "../../components/Card";
import { RelativeDate } from "../../components/RelativeDate";

/**
 * @param {{
 *   hiddenFields: string[];
 *   id: string;
 *   brand: string;
 *   model: string;
 *   nib?: string;
 *   color?: string;
 *   material?: string;
 *   trim_color?: string;
 *   filling_system?: string
 *   price?: string;
 *   comment?: string;
 *   usage?: number;
 *   daily_usage?: number;
 *   last_inked?: string | null;
 *   last_cleaned?: string | null;
 *   last_used_on?: string | null;
 *   created_at?: string;
 * }} props
 */
export const PenCard = (props) => {
  const {
    archived,
    hiddenFields,
    id,
    brand,
    model,
    model_variant_id,
    nib,
    color,
    material,
    trim_color,
    filling_system,
    price,
    comment,
    usage,
    daily_usage,
    last_used_on,
    created_at
  } = props;

  const fullName = `${brand} ${model}`;

  const isVisible = (field) => props[field] && !hiddenFields.includes(field);
  const hasUsage = isVisible("usage") || isVisible("daily_usage") || isVisible("last_used_on");

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {fullName}
          {model_variant_id && (
            <>
              {" "}
              <a href={`/pen_variants/${model_variant_id}`}>
                <i className="fa fa-external-link"></i>
              </a>
            </>
          )}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {isVisible("comment") ? <Card.Text>{comment}</Card.Text> : null}
        {isVisible("color") ? (
          <>
            <div className="small text-secondary">Color</div>
            <Card.Text>{color}</Card.Text>
          </>
        ) : null}
        {isVisible("nib") ? (
          <>
            <div className="small text-secondary">Nib</div>
            <Card.Text>{nib}</Card.Text>
          </>
        ) : null}
        {isVisible("material") ? (
          <>
            <div className="small text-secondary">Material</div>
            <Card.Text>{material}</Card.Text>
          </>
        ) : null}
        {isVisible("trim_color") ? (
          <>
            <div className="small text-secondary">Trim Color</div>
            <Card.Text>{trim_color}</Card.Text>
          </>
        ) : null}
        {isVisible("filling_system") ? (
          <>
            <div className="small text-secondary">Filling System</div>
            <Card.Text>{filling_system}</Card.Text>
          </>
        ) : null}
        {isVisible("price") ? (
          <>
            <div className="small text-secondary">Price</div>
            <Card.Text>{price}</Card.Text>
          </>
        ) : null}
        {hasUsage ? (
          <>
            <div className="small text-secondary">Usage</div>
            <Card.Text data-testid="usage">
              {String(usage)} inked - <LastUsageDisplay last_used_on={last_used_on} /> (
              {pluralizedCountLabel(daily_usage, "daily usage")})
            </Card.Text>
          </>
        ) : null}
        {isVisible("created_at") ? (
          <>
            <div className="small text-secondary">Added On</div>
            <Card.Text>{<RelativeDate date={created_at} relativeAsDefault={false} />}</Card.Text>
          </>
        ) : null}
      </Card.Body>
      <Card.Footer>
        <CollectionEntryActions
          archived={archived}
          name={fullName}
          editHref={archived ? `/collected_pens/archive/${id}/edit` : `/collected_pens/${id}/edit`}
          archiveHref={`/collected_pens/${id}/archive`}
          unarchiveHref={`/collected_pens/archive/${id}/unarchive`}
          deleteHref={`/collected_pens/archive/${id}`}
        />
      </Card.Footer>
    </Card>
  );
};

const LastUsageDisplay = ({ last_used_on }) => {
  if (last_used_on) {
    return (
      <>
        last used <RelativeDate date={last_used_on} />
      </>
    );
  } else {
    return <>never used</>;
  }
};
