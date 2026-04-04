import React from "react";
import { Card } from "../../components/Card";
import { RelativeDate } from "../../components/RelativeDate";
import { ActionsCell } from "../table/ActionsCell";

/**
 * @param {{
 *   hiddenFields: string[];
 *   id: string;
 *   archived: boolean;
 *   archived_on?: string | null;
 *   comment?: string;
 *   daily_usage?: number;
 *   ink_name: string;
 *   ink_color?: string;
 *   inked_on: string;
 *   last_used_on?: string | null;
 *   pen_name: string;
 *   refillable: boolean;
 *   unarchivable?: boolean;
 *   used_today: boolean;
 *   collected_ink: {
 *      archived?: boolean;
 *      brand_name?: string;
 *      color: string;
 *      id: string;
 *      ink_name?: string;
 *      line_name?: string;
 *   };
 *   collected_pen: {
 *      archived?: boolean;
 *      brand?: string;
 *      color?: string;
 *      id: string;
 *      model?: string;
 *      nib?: string;
 *   };
 * }} props
 */
export const CurrentlyInkedCard = (props) => {
  const {
    hiddenFields,
    id,
    archived,
    comment,
    ink_name,
    inked_on,
    last_used_on,
    daily_usage,
    pen_name,
    refillable,
    unarchivable,
    used_today,
    onUsageRecorded,
    collected_ink,
    collected_pen
  } = props;

  const color = collected_ink.color;
  const macro_cluster = collected_ink.micro_cluster?.macro_cluster;
  const model_variant_id = collected_pen?.model_variant_id;

  const isVisible = (field) => props[field] && !hiddenFields.includes(field);

  return (
    <Card>
      {color && <Card.Image className="swab" style={{ "--swab-color": color }} />}
      <Card.Header>
        <Card.Title>
          {ink_name}
          {macro_cluster && (
            <>
              {" "}
              <a href={`/inks/${macro_cluster.id}`}>
                <i className="fa fa-external-link"></i>
              </a>
            </>
          )}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {isVisible("comment") ? <Card.Text>{comment}</Card.Text> : null}
        {isVisible("pen_name") ? (
          <>
            <div className="small text-secondary">Pen</div>
            <Card.Text>
              {pen_name}
              {model_variant_id && (
                <>
                  {" "}
                  <a href={`/pen_variants/${model_variant_id}`}>
                    <i className="fa fa-external-link"></i>
                  </a>
                </>
              )}
            </Card.Text>
          </>
        ) : null}
        {isVisible("inked_on") ? (
          <>
            <div className="small text-secondary">Inked</div>
            <Card.Text>
              <RelativeDate date={inked_on} relativeAsDefault={false} />
            </Card.Text>
          </>
        ) : null}
        {isVisible("last_used_on") ? (
          <>
            <div className="small text-secondary">Last used</div>
            <Card.Text>
              <RelativeDate date={last_used_on} />
            </Card.Text>
          </>
        ) : null}
        {isVisible("daily_usage") ? (
          <>
            <div className="small text-secondary">Usage</div>
            <Card.Text>{daily_usage}</Card.Text>
          </>
        ) : null}
      </Card.Body>
      <Card.Footer>
        <ActionsCell
          id={id}
          archived={archived}
          pen_name={pen_name}
          refillable={refillable}
          ink_name={ink_name}
          used_today={used_today}
          unarchivable={unarchivable}
          onUsageRecorded={onUsageRecorded}
        />
      </Card.Footer>
    </Card>
  );
};
