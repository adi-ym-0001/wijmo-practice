import { Button } from "@/components/ui/button";
import * as wijmo from "@mescius/wijmo";
import { hidePopup, showPopup } from "@mescius/wijmo";
import * as wjGrid from "@mescius/wijmo.grid";
import * as wjFilter from "@mescius/wijmo.grid.filter";
import * as wjSearch from "@mescius/wijmo.grid.search";
import * as wjInput from "@mescius/wijmo.input";
import "@mescius/wijmo.styles/wijmo.css";
import type React from "react";
import { useEffect, useRef } from "react";
import { mergeColumnGroups } from "../utils/mergeColumnGroups";

export interface FundRecord {
  name: string;
  currency: string;
  fundType: string;
  region: string;
  perf: { ytd: number; m1: number; m6: number; m12: number };
  alloc: { stock: number; bond: number; cash: number; other: number; realEstate: number };
  note: string;
  setupDate: Date;
  amount: number;
  achievement: number;
}

interface ColumnGroup {
  header: string;
  binding?: string;
  format?: string;
  width?: string;
  dataType?: string;
  role?: string;
  columns?: ColumnGroup[];
}

interface Props {
  gridId: string;
  columnGroups: ColumnGroup[];
  itemsSource: FundRecord[];
  groupBy?: string[];
}

function flattenFundData(data: FundRecord[]): any[] {
  return data.map((item) => ({
    name: item.name,
    currency: item.currency,
    fundType: item.fundType,
    region: item.region,
    note: item.note,
    setupDate: item.setupDate,
    amount: item.amount,
    achievement: item.achievement,
    perf_m1: item.perf.m1,
    perf_m6: item.perf.m6,
    perf_ytd: item.perf.ytd,
    perf_m12: item.perf.m12,
    alloc_stock: item.alloc.stock,
    alloc_bond: item.alloc.bond,
    alloc_cash: item.alloc.cash,
    alloc_other: item.alloc.other,
    alloc_realEstate: item.alloc.realEstate,
  }));
}

export const HierarchicalGrid: React.FC<Props> = ({
  gridId,
  columnGroups,
  itemsSource,
  groupBy,
}) => {
  const gridRef = useRef<wjGrid.FlexGrid | null>(null);
  const filterRef = useRef<wjFilter.FlexGridFilter | null>(null);
  const searchBoxRef = useRef<HTMLInputElement | null>(null);
  const columnPickerRef = useRef<wjInput.ListBox | null>(null);
  const columnPickerHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const gridHost = document.getElementById(gridId);
      if (!gridHost) return;

      const existingGrid = wijmo.Control.getControl(gridHost);
      if (existingGrid) existingGrid.dispose();

      const grid = new wjGrid.FlexGrid(gridHost);
      gridRef.current = grid;
      grid.autoGenerateColumns = false;

      bindColumnGroups(grid, columnGroups);

      const flattenedItems = flattenFundData(itemsSource);
      const view = new wijmo.CollectionView(flattenedItems, {
        groupDescriptions: groupBy ?? [],
      });

      grid.itemsSource = view;
      filterRef.current = new wjFilter.FlexGridFilter(grid);

      if (searchBoxRef.current) {
        const existingSearch = wijmo.Control.getControl(searchBoxRef.current);
        if (existingSearch) existingSearch.dispose();
        new wjSearch.FlexGridSearch(searchBoxRef.current, {
          grid,
          placeholder: "グローバル検索",
        });
      }

      // 列ピッカー初期化
      if (columnPickerHostRef.current) {
        columnPickerRef.current = new wjInput.ListBox(columnPickerHostRef.current, {
          itemsSource: grid.columns,
          checkedMemberPath: "visible",
          displayMemberPath: "header",
          lostFocus: () => hidePopup(columnPickerHostRef.current!),
        });
      }

      // 左上セルにギアアイコンを追加
      grid.formatItem.addHandler((s, e) => {
        if (e.panel === s.topLeftCells) {
          e.cell.innerHTML = '<span class="column-picker-icon" style="cursor:pointer;">⚙️</span>';
        }
      });

      // ギアアイコンクリックで列ピッカー表示
      grid.hostElement.addEventListener("mousedown", (e) => {
        if ((e.target as HTMLElement).classList.contains("column-picker-icon")) {
          const host = columnPickerHostRef.current!;
          if (!host.offsetHeight) {
            showPopup(host, grid.hostElement, false, true, false);
            columnPickerRef.current?.focus();
          } else {
            hidePopup(host, true, true);
            grid.focus();
          }
          e.preventDefault();
        }
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [gridId, columnGroups, itemsSource, groupBy]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          ref={searchBoxRef}
          id="gridSearchBox"
          placeholder="グローバル検索"
          style={{ flex: 1, padding: "4px", fontSize: "14px" }}
        />
        <Button onClick={() => filterRef.current?.clear()}>フィルタをリセット</Button>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div id={gridId} className="wj-flexgrid" style={{ height: "100%", width: "100%" }} />
        <div
          ref={columnPickerHostRef}
          style={{
            display: "none",
            position: "absolute",
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
};

function bindColumnGroups(flex: wjGrid.FlexGrid, columnGroups: ColumnGroup[]) {
  createColumnGroups(flex, columnGroups, 0);
  mergeColumnGroups(flex);

  flex.formatItem.addHandler((_s, e) => {
    if (e.panel === flex.columnHeaders) {
      const col = flex.columns[e.col];
      const role = (col as any)["__role"];

      const roleColors: Record<string, string> = {
        allocation: "#e0f7fa",
        performance: "#fce4ec",
        meta: "#f3e5f5",
      };
      if (role && roleColors[role]) {
        e.cell.style.backgroundColor = roleColors[role];
      }

      e.cell.innerHTML = `<div>${e.cell.innerHTML}</div>`;
      wijmo.setCss(e.cell, {
        display: "table",
        tableLayout: "fixed",
      });
      wijmo.setCss(e.cell.children[0], {
        display: "table-cell",
        verticalAlign: "middle",
        textAlign: "center",
      });
    }
  });

  flex.allowSorting = wjGrid.AllowSorting.MultiColumn;
  flex.allowDragging = wjGrid.AllowDragging.None;

  flex.addEventListener(flex.hostElement, "click", (e: MouseEvent) => {
    const ht = flex.hitTest(e);
    if (ht.panel === flex.columnHeaders) {
      const rng =
        flex.getMergedRange(flex.columnHeaders, ht.row, ht.col, false) || ht.range;
      flex.select(new wjGrid.CellRange(0, rng.col, flex.rows.length - 1, rng.col2));
      e.preventDefault();
    }
  });
}

function createColumnGroups(
  flex: wjGrid.FlexGrid,
  columnGroups: ColumnGroup[],
  level: number
) {
  const colHdrs = flex.columnHeaders;

  if (level >= colHdrs.rows.length) {
    colHdrs.rows.push(new wjGrid.Row());
  }

  for (const group of columnGroups) {
    if (!group.columns) {
      const col = new wjGrid.Column();
      Object.assign(col, group);
      col.allowSorting = true;
      if (group.role) {
        (col as any)["__role"] = group.role;
      }
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
