// @ts-check
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrentlyInkedCard } from "./CurrentlyInkedCard";

const setup = (jsx, options) => {
  return {
    user: userEvent.setup(),
    ...render(jsx, options)
  };
};

describe("<SwabCard />", () => {
  it("renders a comment if one is present", () => {
    const { getByText } = setup(
      <CurrentlyInkedCard
        id="1"
        archived={false}
        ink_name="Black"
        inked_on="2023-06-19"
        last_used_on="2023-06-19"
        pen_name="Pilot Metropolitan"
        comment="Blacker than the blackest black"
        refillable={true}
        used_today={true}
        collected_ink={{
          id: "1",
          color: "#000",
          micro_cluster: {
            id: "1"
          }
        }}
        collected_pen={{
          id: "1"
        }}
        hiddenFields={[]}
      />
    );

    expect(getByText("Blacker than the blackest black")).toBeInTheDocument();
  });

  it("hides as expected if given hidden fields", () => {
    const { queryByText } = setup(
      <CurrentlyInkedCard
        id="1"
        archived={false}
        ink_name="Black"
        inked_on="2023-06-19"
        pen_name="Pilot Metropolitan"
        comment="Blacker than the blackest black"
        refillable={true}
        used_today={true}
        collected_ink={{
          id: "1",
          color: "#000",
          micro_cluster: {
            id: "1"
          }
        }}
        collected_pen={{
          id: "1"
        }}
        hiddenFields={["comment", "pen_name", "inked_on", "last_used_on"]}
      />
    );

    expect(queryByText("Blacker than the blackest black")).not.toBeInTheDocument();
    expect(queryByText("Pen")).not.toBeInTheDocument();
    expect(queryByText("Pilot Metropolitan")).not.toBeInTheDocument();
    expect(queryByText("Inked")).not.toBeInTheDocument();
    expect(queryByText("Last used")).not.toBeInTheDocument();
  });

  it("renders without crashing when micro_cluster is null", () => {
    const { getByText } = setup(
      <CurrentlyInkedCard
        id="1"
        archived={false}
        ink_name="Black"
        inked_on="2023-06-19"
        pen_name="Pilot Metropolitan"
        refillable={true}
        used_today={true}
        collected_ink={{
          id: "1",
          color: "#000",
          micro_cluster: null
        }}
        collected_pen={{
          id: "1"
        }}
        hiddenFields={[]}
      />
    );

    expect(getByText("Black")).toBeInTheDocument();
  });

  it("renders ink link when macro_cluster is present", () => {
    const { container } = setup(
      <CurrentlyInkedCard
        id="1"
        archived={false}
        ink_name="Black"
        inked_on="2023-06-19"
        pen_name="Pilot Metropolitan"
        refillable={true}
        used_today={true}
        collected_ink={{
          id: "1",
          color: "#000",
          micro_cluster: {
            id: "1",
            macro_cluster: { id: "42" }
          }
        }}
        collected_pen={{
          id: "1"
        }}
        hiddenFields={[]}
      />
    );

    const link = container.querySelector('a[href="/inks/42"]');
    expect(link).toBeInTheDocument();
  });
});
