import { renderHook, act } from "@testing-library/react";
import { useTableFilter } from "./useTableFilter";

const fuzzyMatch = (data, filterText) => {
  if (!filterText) return data;
  return data.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(filterText.toLowerCase()))
  );
};

const data = [{ name: "Diamine Sepia" }, { name: "Pilot Iroshizuku" }];

describe("useTableFilter", () => {
  it("returns all data when filter is empty", () => {
    const { result } = renderHook(() => useTableFilter(data, [], fuzzyMatch));
    expect(result.current.filteredData).toEqual(data);
  });

  it("filters data when setGlobalFilter is called with a value", () => {
    const { result } = renderHook(() => useTableFilter(data, [], fuzzyMatch));
    act(() => {
      result.current.setGlobalFilter("Diamine");
    });
    expect(result.current.filteredData).toEqual([{ name: "Diamine Sepia" }]);
  });

  it("resets to all data when setGlobalFilter is called with undefined", () => {
    const { result } = renderHook(() => useTableFilter(data, [], fuzzyMatch));
    act(() => {
      result.current.setGlobalFilter("Diamine");
    });
    act(() => {
      result.current.setGlobalFilter(undefined);
    });
    expect(result.current.filteredData).toEqual(data);
  });

  it("exposes setGlobalFilter as a function", () => {
    const { result } = renderHook(() => useTableFilter(data, [], fuzzyMatch));
    expect(typeof result.current.setGlobalFilter).toBe("function");
  });
});
