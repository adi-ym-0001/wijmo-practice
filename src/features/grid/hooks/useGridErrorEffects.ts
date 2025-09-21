// Wijmoのユーティリティとグリッド機能をインポート
import * as wijmo from "@mescius/wijmo";
import * as wjGrid from "@mescius/wijmo.grid";

// Reactの副作用フック
import { useEffect } from "react";

// セルエラー情報の型定義（行・列・メッセージ）
import type { CellError } from "../components/Grid";

/**
 * グリッドに対して、エラーセルの背景色とツールチップ表示を適用するカスタムフック
 *
 * @param gridRef - Wijmo FlexGrid の参照（useRef）
 * @param errors - セル単位のエラー情報一覧
 */
export const useGridErrorEffects = (gridRef: any, errors: CellError[]) => {
  useEffect(() => {
    const grid = gridRef.current?.control;
    if (!grid) return;

    /**
     * セル描画時に背景色を変更するイベントハンドラ
     * formatItem は Wijmo の描画ライフサイクルにフックする
     */
    grid.formatItem.addHandler((s, e) => {
      if (e.panel === s.cells) {
        // 該当セルにエラーがある場合、背景色をピンクに設定
        const err = errors.find((er) => er.row === e.row && er.col === e.col);
        e.cell.style.backgroundColor = err ? "#ffe4e1" : "";
      }
    });

    // Wijmoのツールチップインスタンスを生成
    const tip = new wijmo.Tooltip();
    let rng: wijmo.grid.CellRange | null = null; // 現在表示中のセル範囲

    /**
     * マウス移動時にツールチップを表示するイベントハンドラ
     */
    const mouseMoveHandler = (e: MouseEvent) => {
      const ht = grid.hitTest(e.pageX, e.pageY); // マウス位置のセル情報を取得

      // 表示中のセルが変わった場合のみ処理
      if (!rng || !ht.range.equals(rng)) {
        if (ht.cellType === wjGrid.CellType.Cell) {
          const err = errors.find((er) => er.row === ht.row && er.col === ht.col);
          if (err) {
            rng = ht.range;

            // セルのDOM要素と位置情報を取得
            const cellElement = document.elementFromPoint(e.clientX, e.clientY);
            const cellBounds = grid.getCellBoundingRect(ht.row, ht.col);
            const data = wijmo.escapeHtml(err.message); // HTMLエスケープ

            // セル要素が存在し、クラス名が "wj-cell" の場合のみ表示
            if (cellElement && cellElement.className.indexOf("wj-cell") > -1) {
              tip.show(grid.hostElement, data, cellBounds);
            }
          } else {
            // エラーがない場合はツールチップを非表示
            tip.hide();
            rng = null;
          }
        } else {
          // セル以外（ヘッダーなど）では非表示
          tip.hide();
          rng = null;
        }
      }
    };

    /**
     * マウスがグリッド外に出たときにツールチップを非表示にする
     */
    const mouseOutHandler = () => {
      tip.hide();
      rng = null;
    };

    // グリッド要素にイベントリスナーを登録
    grid.hostElement.addEventListener("mousemove", mouseMoveHandler);
    grid.hostElement.addEventListener("mouseout", mouseOutHandler);

    // クリーンアップ処理（アンマウント時）
    return () => {
      grid.hostElement.removeEventListener("mousemove", mouseMoveHandler);
      grid.hostElement.removeEventListener("mouseout", mouseOutHandler);
      tip.dispose(); // ツールチップインスタンスを破棄
    };
  }, [errors]); // エラー一覧が更新されたときに再評価
};
