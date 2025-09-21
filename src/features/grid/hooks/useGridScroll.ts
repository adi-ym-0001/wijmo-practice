// WijmoのCollectionView型をインポート（データビューの再構築に使用）
import { CollectionView } from "@mescius/wijmo";

// モックAPIからデータを取得する関数
import { fetchData } from "../mocks/mockApi";

// データの最大件数と1ページあたりの取得件数を定義
const MAX_RECORDS = 10000;
const PAGE_SIZE = 40;

/**
 * FlexGridのスクロールイベントに応じて、末尾にデータを追加する関数
 *
 * @param grid - WijmoのFlexGridインスタンス
 * @param dataRef - 現在保持しているデータ配列（useRefで管理）
 * @param setDataView - CollectionViewを更新するためのステート更新関数
 */
export const handleScroll = (
  grid: any,
  dataRef: React.MutableRefObject<any[]>,
  setDataView: (view: CollectionView) => void,
) => {
  // 現在の表示範囲の最下行インデックスを取得
  const bottomRow = grid.viewRange?.bottomRow ?? 0;

  // グリッド全体の行数
  const totalRows = grid.rows.length;

  // 最下行までスクロールされ、かつ最大件数未満の場合に追加読み込みを実行
  if (bottomRow >= totalRows - 1 && dataRef.current.length < MAX_RECORDS) {
    // 新しいデータを取得（現在の件数から次のページ分）
    const more = fetchData(dataRef.current.length, PAGE_SIZE);

    // 既存データに追加
    dataRef.current.push(...more);

    // CollectionViewを再構築してグリッドに反映
    const updatedView = new CollectionView(dataRef.current, {
      groupDescriptions: ["category"], // カテゴリでグループ化
    });

    // グリッドの表示データを更新
    setDataView(updatedView);
  }
};
