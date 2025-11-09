// Wijmoの主要モジュールをインポート
import * as wijmo from "@mescius/wijmo";
import * as wjGrid from "@mescius/wijmo.grid";
import * as wjFilter from "@mescius/wijmo.grid.filter";
import * as wjSearch from "@mescius/wijmo.grid.search";
import "@mescius/wijmo.styles/wijmo.css";

import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
// UIコンポーネントとReact関連
import { Button } from "@/components/ui/button";

// ヘッダー結合ユーティリティ（外部定義）
import { mergeColumnGroups } from "../utils/mergeColumnGroups";

// データ型：1行分のファンド情報
export interface FundRecord {
	name: string;
	currency: string;
	fundType: string;
	region: string;
	perf: { ytd: number; m1: number; m6: number; m12: number };
	alloc: {
		stock: number;
		bond: number;
		cash: number;
		other: number;
		realEstate: number;
	};
	note: string;
	setupDate: Date;
	amount: number;
	achievement: number;
}

// ヘッダー構造定義（階層可能）
interface ColumnGroup {
	header: string;
	binding?: string;
	format?: string;
	width?: string;
	dataType?: string;
	role?: string;
	columns?: ColumnGroup[];
}

// グリッド列にカスタムプロパティを追加するための型拡張
interface RoleColumn extends wjGrid.Column {
	__role?: string;
}

// 列ピッカー用の階層ノード型
interface ColumnNode {
	label: string;
	binding?: string;
	children?: ColumnNode[];
}

// コンポーネントのprops型
interface Props {
	gridId: string;
	columnGroups: ColumnGroup[];
	itemsSource: FundRecord[];
	groupBy?: string[];
}

// データをフラット化してFlexGridに渡せる形式に変換
function flattenFundData(data: FundRecord[]): Record<string, unknown>[] {
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

// メインコンポーネント：FlexGrid + 列ピッカー
export const HierarchicalGrid: React.FC<Props> = ({
	gridId,
	columnGroups,
	itemsSource,
	groupBy,
}) => {
	const gridRef = useRef<wjGrid.FlexGrid | null>(null);
	const filterRef = useRef<wjFilter.FlexGridFilter | null>(null);
	const searchBoxRef = useRef<HTMLInputElement | null>(null);
	const columnPickerHostRef = useRef<HTMLDivElement | null>(null);
	const searchBoxId = useId();

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

			// ギアアイコン追加（左上セル）
			grid.formatItem.addHandler((s, e) => {
				if (e.panel === s.topLeftCells) {
					e.cell.innerHTML =
						'<span class="column-picker-icon" style="cursor:pointer;">⚙️</span>';
				}
			});

			// ギアアイコンのクリックで列ピッカー表示切替
			grid.hostElement.addEventListener("mousedown", (e) => {
				if (
					(e.target as HTMLElement).classList.contains("column-picker-icon")
				) {
					const host = columnPickerHostRef.current;
					if (!host) return;
					host.style.display = host.style.display === "none" ? "block" : "none";
					e.preventDefault();
				}
			});

			// 列ピッカー描画（ReactDOMで動的描画）
			if (columnPickerHostRef.current && gridRef.current) {
				const columnTree = buildColumnTree(columnGroups);
				const host = columnPickerHostRef.current;
				host.innerHTML = "";

				const container = document.createElement("div");
				host.appendChild(container);

				const root = ReactDOM.createRoot(container);
				root.render(
					<div style={{ padding: "8px" }}>
						{columnTree.map((node) => (
							<ColumnTreeView key={node.label} node={node} grid={grid} />
						))}
					</div>,
				);
			}
		}, 0);

		return () => clearTimeout(timeout);
	}, [gridId, columnGroups, itemsSource, groupBy]);

	return (
		<div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			<div
				style={{
					padding: "8px",
					display: "flex",
					gap: "8px",
					alignItems: "center",
				}}
			>
				<input
					ref={searchBoxRef}
					id={searchBoxId}
					placeholder="グローバル検索"
					style={{ flex: 1, padding: "4px", fontSize: "14px" }}
				/>
				<Button onClick={() => filterRef.current?.clear()}>
					フィルタをリセット
				</Button>
			</div>
			<div style={{ flex: 1, position: "relative" }}>
				<div
					id={gridId}
					className="wj-flexgrid"
					style={{ height: "100%", width: "100%" }}
				/>
				<div
					ref={columnPickerHostRef}
					style={{
						display: "none",
						position: "fixed",
						top: "40px",
						left: "40px",
						minWidth: "300px",
						minHeight: "200px",
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

// 列とヘッダー階層をFlexGridに設定
function bindColumnGroups(flex: wjGrid.FlexGrid, columnGroups: ColumnGroup[]) {
	createColumnGroups(flex, columnGroups, 0);
	mergeColumnGroups(flex);

	flex.formatItem.addHandler((_s, e) => {
		if (e.panel === flex.columnHeaders) {
			const col = flex.columns[e.col] as RoleColumn;
			const role = col.__role;

			const roleColors: Record<string, string> = {
				allocation: "#e0f7fa",
				performance: "#fce4ec",
				meta: "#f3e5f5",
			};
			if (role && roleColors[role]) {
				e.cell.style.backgroundColor = roleColors[role];
			}

			e.cell.innerHTML = `<div>${e.cell.innerHTML}</div>`;
			wijmo.setCss(e.cell, { display: "table", tableLayout: "fixed" });
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
				flex.getMergedRange(flex.columnHeaders, ht.row, ht.col, false) ||
				ht.range;
			flex.select(
				new wjGrid.CellRange(0, rng.col, flex.rows.length - 1, rng.col2),
			);
			e.preventDefault();
		}
	});
}

// 再帰的に列とヘッダー階層を構築
function createColumnGroups(
	flex: wjGrid.FlexGrid,
	columnGroups: ColumnGroup[],
	level: number,
) {
	const colHdrs = flex.columnHeaders;

	if (level >= colHdrs.rows.length) {
		colHdrs.rows.push(new wjGrid.Row());
	}

	for (const group of columnGroups) {
		if (!group.columns) {
			const col = new wjGrid.Column() as RoleColumn;
			Object.assign(col, group);
			col.allowSorting = true;
			if (group.role) {
				col.__role = group.role;
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

// ColumnGroup を ColumnNode に変換（列ピッカー用の階層構造）
function buildColumnTree(
	groups: ColumnGroup[],
	path: string[] = [],
): ColumnNode[] {
	return groups.map((group) => {
		const newPath = [...path, group.header];
		if (group.columns) {
			return {
				label: newPath.join(" > "),
				children: buildColumnTree(group.columns, newPath),
			};
		} else {
			return {
				label: newPath.join(" > "),
				binding: group.binding,
			};
		}
	});
}

// 指定された列の表示/非表示を切り替える
function setColumnVisibility(
	binding: string,
	visible: boolean,
	grid: wjGrid.FlexGrid,
) {
	if (!binding) return;
	const col = grid.columns.find((c) => c.binding === binding);
	if (col) col.visible = visible;
}

// ノードとその子ノードの列表示状態を一括で切り替える
function toggleGroupVisibility(
	node: ColumnNode,
	visible: boolean,
	grid: wjGrid.FlexGrid,
) {
	if (node.binding) {
		setColumnVisibility(node.binding, visible, grid);
	}
	if (node.children) {
		node.children.forEach((child) => {
			toggleGroupVisibility(child, visible, grid);
		});
	}
}

// チェックボックス付きの階層列ピッカーを描画
function ColumnTreeView({
	node,
	grid,
	parentChecked,
}: {
	node: ColumnNode;
	grid: wjGrid.FlexGrid;
	parentChecked?: boolean;
}) {
	const [checked, setChecked] = useState(true);

	// 親のチェック状態が変わったら反映
	useEffect(() => {
		if (parentChecked !== undefined) {
			setChecked(parentChecked);
		}
	}, [parentChecked]);

	// チェック状態が変わったら列の表示/非表示を更新
	useEffect(() => {
		toggleGroupVisibility(node, checked, grid);
	}, [checked, node, grid]);

	// チェックボックスの変更イベント
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(e.target.checked);
	};

	return (
		<div style={{ marginLeft: "12px", marginBottom: "4px" }}>
			<label>
				<input type="checkbox" checked={checked} onChange={handleChange} />
				{node.label}
			</label>
			{/* 子ノードがあれば再帰的に描画 */}
			{node.children?.map((child) => (
				<ColumnTreeView
					key={child.label}
					node={child}
					grid={grid}
					parentChecked={checked}
				/>
			))}
		</div>
	);
}
