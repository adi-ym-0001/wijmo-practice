import * as wjcGrid from "@mescius/wijmo.react.grid";
import React from "react";
import { fetchHeaderDefinition } from "../mocks/mockApi";

export const generateColumns = () => {
  const layout = fetchHeaderDefinition();
  const cols: React.ReactElement[] = [];

  for (const group of layout) {
    for (const cell of group.cells) {
      if (cell.binding) {
        cols.push(
          <wjcGrid.FlexGridColumn
            key={cell.binding}
            binding={cell.binding}
            header={cell.header}
            align={cell.align ?? "left"}
            allowSorting={false}
          />
        );
      }
    }
  }

  return cols;
};
