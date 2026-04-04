import Jsona from "jsona";
import React from "react";
import { getRequest } from "../fetch";

const formatter = new Jsona();

const appendPageNumber = (endpoint, pageNumber) => {
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}page[number]=${pageNumber}`;
};

const getJson = async (url) => {
  const response = await getRequest(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

export const CollectionListPageShell = ({
  endpoint,
  loadingComponent,
  children,
  paginated,
  postProcess
}) => {
  const [items, setItems] = React.useState();

  React.useEffect(() => {
    async function fetchItems() {
      try {
        if (!paginated) {
          const json = await getJson(endpoint);
          const deserialized = formatter.deserialize(json);
          setItems(postProcess ? postProcess(deserialized) : deserialized);
          return;
        }

        let receivedItems = [];
        let page = 1;

        do {
          const json = await getJson(appendPageNumber(endpoint, page));
          page = json.meta.pagination.next_page;
          receivedItems.push(...formatter.deserialize(json));
        } while (page);

        setItems(postProcess ? postProcess(receivedItems) : receivedItems);
      } catch (error) {
        console.error("Failed to fetch collection list data:", error);
        setItems([]);
      }
    }

    fetchItems();
  }, [endpoint, paginated, postProcess]);

  if (!items) {
    return loadingComponent;
  }

  return children(items, setItems);
};
