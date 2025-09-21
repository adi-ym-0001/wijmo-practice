// WijmoのCollectionView型をインポート（データソースとして使用）
import { CollectionView } from "@mescius/wijmo";
import type { CellError } from "../components/Grid";

// グリッドのデータに対してバリデーションを実行し、エラー一覧を返す関数
export const validateGrid = (view: CollectionView): CellError[] => {
  const errs: CellError[] = [];

  // 各行のデータに対してチェックを実行
  view.items.forEach((item, row) => {
    // 商品名が未入力の場合 → 列1にエラー
    if (!item.product)
      errs.push({ row, col: 1, message: "商品名が未入力です" });

    // 売上が100未満の場合 → 列5にエラー
    if (item.sales < 100)
      errs.push({ row, col: 5, message: "売上が低すぎます" });

    // 評価が「D」の場合 → 列7にエラー
    if (item.rating === "D")
      errs.push({ row, col: 7, message: "評価が低すぎます" });
  });

  // エラー一覧を返却
  return errs;
};
