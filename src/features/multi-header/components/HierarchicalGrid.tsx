import * as wijmo from '@mescius/wijmo';
import * as wjGrid from '@mescius/wijmo.grid';
import '@mescius/wijmo.styles/wijmo.css';
import React, { useEffect, useRef } from 'react';

interface ColumnGroup {
  header: string;
  binding?: string;
  format?: string;
  width?: string;
  columns?: ColumnGroup[];
}

interface Props {
  gridId: string;
  columnGroups: ColumnGroup[];
  itemsSource: any[];
}

export const HierarchicalGrid: React.FC<Props> = ({ gridId, columnGroups, itemsSource }) => {
  const gridRef = useRef<wjGrid.FlexGrid | null>(null);

  useEffect(() => {
    const grid = new wjGrid.FlexGrid(`#${gridId}`);
    gridRef.current = grid;
    grid.autoGenerateColumns = false;

    bindColumnGroups(grid, columnGroups);
    grid.itemsSource = itemsSource;

    return () => {
      grid.dispose();
    };
  }, [gridId, columnGroups, itemsSource]);

  return <div id={gridId} className="wj-flexgrid" style={{ height: 400 }} />;
};

function bindColumnGroups(flex: wjGrid.FlexGrid, columnGroups: ColumnGroup[]) {
  createColumnGroups(flex, columnGroups, 0);
  mergeColumnGroups(flex);

  flex.formatItem.addHandler((s, e) => {
    if (e.panel === flex.columnHeaders) {
      e.cell.innerHTML = `<div>${e.cell.innerHTML}</div>`;
      wijmo.setCss(e.cell, {
        display: 'table',
        tableLayout: 'fixed',
      });
      wijmo.setCss(e.cell.children[0], {
        display: 'table-cell',
        verticalAlign: 'middle',
        textAlign: 'center',
      });
    }
  });

  flex.allowSorting = wjGrid.AllowSorting.MultiColumn;
  flex.allowDragging = wjGrid.AllowDragging.None;

  flex.addEventListener(flex.hostElement, 'click', (e: MouseEvent) => {
    const ht = flex.hitTest(e);
    if (ht.panel === flex.columnHeaders) {
      const rng = flex.getMergedRange(flex.columnHeaders, ht.row, ht.col, false) || ht.range;
      flex.select(new wjGrid.CellRange(0, rng.col, flex.rows.length - 1, rng.col2));
      e.preventDefault();
    }
  });
}

function createColumnGroups(flex: wjGrid.FlexGrid, columnGroups: ColumnGroup[], level: number) {
  const colHdrs = flex.columnHeaders;

  if (level >= colHdrs.rows.length) {
    colHdrs.rows.push(new wjGrid.Row());
  }

  for (const group of columnGroups) {
    if (!group.columns) {
      const col = new wjGrid.Column();
      Object.assign(col, group);
      flex.columns.push(col);
      colHdrs.setCellData(level, flex.columns.length - 1, group.header);
    } else {
      const colIndex = flex.columns.length;
      createColumnGroups(flex, group.columns, level + 1);
      for (let j = colIndex; j < flex.columns.length; j++) {
        colHdrs.setCellData(level, j, group.header);
      }
    }
  }
}

function mergeColumnGroups(flex: wjGrid.FlexGrid) {
  const colHdrs = flex.columnHeaders;
  flex.allowMerging = wjGrid.AllowMerging.ColumnHeaders;

  colHdrs.rows.forEach(row => (row.allowMerging = true));
  flex.columns.forEach(col => (col.allowMerging = true));

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
