import { CurrentlyInkedSummaryWidget } from "./currently_inked_summary_widget";
import { InksGroupedByBrandWidget } from "./inks_grouped_by_brand_widget";
import { InksSummaryWidget } from "./inks_summary_widget";
import { InksVisualizationWidget } from "./inks_visualization_widget";
import { LeaderboardRankingWidget } from "./leaderboard_ranking_widget";
import { PenAndInkSuggestionWidget } from "./pen_and_ink_suggestion_widget";
import { PensGroupedByBrandWidget } from "./pens_grouped_by_brand_widget";
import { PensSummaryWidget } from "./pens_summary_widget";

export const WIDGET_REGISTRY = [
  {
    id: "currently_inked_summary",
    label: "Currently Inked",
    component: CurrentlyInkedSummaryWidget
  },
  { id: "inks_summary", label: "Inks Summary", component: InksSummaryWidget },
  { id: "pens_summary", label: "Pens Summary", component: PensSummaryWidget },
  {
    id: "inks_grouped_by_brand",
    label: "Inks by Brand",
    component: InksGroupedByBrandWidget
  },
  {
    id: "pens_grouped_by_brand",
    label: "Pens by Brand",
    component: PensGroupedByBrandWidget
  },
  {
    id: "inks_visualization",
    label: "Ink Visualization",
    component: InksVisualizationWidget
  },
  {
    id: "leaderboard_ranking",
    label: "Leaderboards",
    component: LeaderboardRankingWidget
  },
  {
    id: "pen_and_ink_suggestion",
    label: "Pen & Ink Suggestion",
    component: PenAndInkSuggestionWidget
  }
];

export const WIDGET_REGISTRY_MAP = Object.fromEntries(WIDGET_REGISTRY.map((w) => [w.id, w]));
