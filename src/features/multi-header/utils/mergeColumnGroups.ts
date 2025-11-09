import * as wjGrid from "@mescius/wijmo.grid";

export function mergeColumnGroups(flex: wjGrid.FlexGrid) {
  const colHdrs = flex.columnHeaders;
  flex.allowMerging = wjGrid.AllowMerging.ColumnHeaders;

  colHdrs.rows.forEach((row) => {
    row.allowMerging = true;
  });
  flex.columns.forEach((col) => {
    col.allowMerging = true;
  });

  for (let c = 0; c < flex.columns.length; c++) {
    for (let r = 1; r < colHdrs.rows.length; r++) {
      const hdr = colHdrs.getCellData(r, c, false);
      if (!hdr || hdr === flex.columns[c].binding) {
        const above = colHdrs.getCellData(r - 1, c, false);
        colHdrs.setCellData(r, c, above);
      }
    }
  }

  for (let c = 0; c < flex.topLeftCells.columns.length; c++) {
    flex.topLeftCells.columns[c].allowMerging = true;
  }
}
