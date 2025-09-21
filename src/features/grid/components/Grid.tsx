// Wijmoのデータ管理とグリッド表示に必要なモジュールをインポート
import { CollectionView } from "@mescius/wijmo";
import * as wjcGrid from "@mescius/wijmo.react.grid";
import "@mescius/wijmo.styles/wijmo.css";

// Reactの基本フックとSonnerによるトースト通知
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// 分割されたロジック・UIコンポーネント・ユーティリティのインポート
import { useGridErrorEffects } from "../hooks/useGridErrorEffects"; // 背景色とツールチップの副作用
import { handleScroll } from "../hooks/useGridScroll"; // スクロール時のデータ追加
import { fetchData } from "../mocks/mockApi"; // モックデータ取得
import { validateGrid } from "../utils/validateGrid"; // 入力チェック
import { ErrorPanel } from "./ErrorPanel"; // エラー一覧パネル
import { generateColumns } from "./GridColumns"; // 列定義生成

// エラー情報の型定義
export type CellError = {
  row: number;
  col: number;
  message: string;
};

const PAGE_SIZE = 40; // 1ページあたりのデータ件数

export const Grid = () => {
  // グリッド表示用のデータビュー
  const [dataView, setDataView] = useState<CollectionView>();

  // 入力エラー一覧
  const [errors, setErrors] = useState<CellError[]>([]);

  // エラー一覧パネルの表示状態
  const [showErrorPanel, setShowErrorPanel] = useState(false);

  // Wijmoグリッドの参照
  const gridRef = useRef<any>(null);

  // データの保持（スクロール追加用）
  const dataRef = useRef<any[]>([]);

  // 初期データの読み込み（初回のみ）
  useEffect(() => {
    const initialData = fetchData(0, PAGE_SIZE);
    dataRef.current = initialData;

    const view = new CollectionView(initialData, {
      groupDescriptions: ["category"], // カテゴリでグループ化
    });

    setDataView(view);
  }, []);

  // セルの背景色とツールチップ表示の副作用を適用
  useGridErrorEffects(gridRef, errors);

  // 保存ボタン押下時の処理
  const handleSave = () => {
    const grid = gridRef.current?.control;
    const view = grid?.itemsSource as CollectionView;

    // 入力チェックを実行
    const newErrors = validateGrid(view);
    setErrors(newErrors);

    if (newErrors.length > 0) {
      // エラーあり → トースト通知＋パネル表示ボタン
      toast.error(`保存失敗：${newErrors.length}件の入力エラー`, {
        description: "セルを確認してください",
        action: {
          label: "詳細を見る",
          onClick: () => setShowErrorPanel(true),
        },
        duration: 8000,
      });
    } else {
      // エラーなし → 成功通知
      toast.success("保存完了", {
        description: "すべてのデータが正常です",
        duration: 3000,
      });
      setShowErrorPanel(false);
    }
  };

  // エラー一覧から該当セルにジャンプする処理
  const jumpToCell = (row: number, col: number) => {
    const grid = gridRef.current?.control;
    if (grid) {
      // 遅延実行で描画後にジャンプ（仮想スクロール対策）
      setTimeout(() => {
        grid.scrollIntoView(row, col); // スクロールして表示
        grid.select(row, col);         // セル選択
        grid.focus();                  // フォーカスを当てる
      }, 0);
    }
  };

  return (
    <div className="p-4">
      {/* タイトル */}
      <h1 className="text-xl font-bold mb-4">商品一覧</h1>

      {/* Wijmoグリッド本体 */}
      <wjcGrid.FlexGrid
        ref={gridRef}
        itemsSource={dataView}
        scrollPositionChanged={(grid) =>
          handleScroll(grid, dataRef, setDataView)
        }
        headersVisibility="Column"
        allowMerging="ColumnHeaders"
        showGroups={true}
        allowSorting={false}
      >
        {generateColumns()}
      </wjcGrid.FlexGrid>

      {/* 保存ボタン */}
      <div className="mt-4 flex gap-4 items-center">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          保存
        </button>
      </div>

      {/* エラー一覧パネル（右下） */}
      {showErrorPanel && errors.length > 0 && (
        <ErrorPanel
          errors={errors}
          onJump={jumpToCell}
          onClose={() => setShowErrorPanel(false)}
        />
      )}
    </div>
  );
};
