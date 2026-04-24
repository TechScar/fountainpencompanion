import Jsona from "jsona";
import { useEffect, useState } from "react";
import { CardsPlaceholder } from "../components/CardsPlaceholder";
import { TablePlaceholder } from "../components/TablePlaceholder";
import { getRequest } from "../fetch";
import { useLayout } from "../useLayout";
import { useScreen } from "../useScreen";
import { CollectedPensCards } from "./cards/CollectedPensCards";
import { CollectedPensTable } from "./table/CollectedPensTable";

const formatter = new Jsona();

export const storageKeyLayout = "fpc-collected-pens-layout";

export const CollectedPens = () => {
  const [pens, setPens] = useState();

  useEffect(() => {
    async function getCollectedPens() {
      setPens(await getPens());
    }
    getCollectedPens().catch(() => {});
  }, []);

  const screen = useScreen();
  const { layout, onLayoutChange } = useLayout(storageKeyLayout);

  if (layout ? layout === "card" : screen.isSmall) {
    if (pens) {
      return <CollectedPensCards pens={pens} onLayoutChange={onLayoutChange} />;
    } else {
      return <CardsPlaceholder />;
    }
  } else {
    if (pens) {
      return <CollectedPensTable pens={pens} onLayoutChange={onLayoutChange} />;
    } else {
      return <TablePlaceholder />;
    }
  }
};

const getPens = async () => {
  let receivedPens = [];
  let page = 1;
  do {
    const json = await getPage(page);
    page = json.meta?.pagination?.next_page;
    receivedPens.push(...formatter.deserialize(json));
  } while (page);
  return receivedPens;
};

const getPage = async (page) => {
  const response = await getRequest(
    `/api/v1/collected_pens.json?filter[archived]=false&page[number]=${page}`
  );
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const json = await response.json();
  return json;
};
