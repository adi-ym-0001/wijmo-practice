// セルエラー情報の型定義をインポート（行・列・メッセージ）
import type { CellError } from "./Grid";

// コンポーネントのProps型定義
type Props = {
  errors: CellError[];                          // 表示するエラー一覧
  onJump: (row: number, col: number) => void;   // セルジャンプ処理
  onClose: () => void;                          // パネルを閉じる処理
};

/**
 * 入力エラー一覧を表示する右下固定パネル
 * 各エラー項目をクリックすると該当セルにジャンプできる
 */
export const ErrorPanel = ({ errors, onJump, onClose }: Props) => {
  return (
    <div className="fixed bottom-4 right-4 w-[320px] max-h-[60vh] overflow-y-auto bg-white shadow-lg border rounded p-4 z-50">
      {/* パネルタイトル */}
      <div className="font-semibold text-lg mb-2">入力エラー一覧</div>

      {/* エラーリスト（行・列・メッセージ） */}
      <ul className="space-y-2 text-sm">
        {errors.map((err, i) => (
          <li key={i}>
            <button
              onClick={() => onJump(err.row, err.col)} // 該当セルにジャンプ
              className="text-red-600 underline"
            >
              行{err.row + 1}・列{err.col + 1}: {err.message}
            </button>
          </li>
        ))}
      </ul>

      {/* パネルを閉じるボタン */}
      <button
        onClick={onClose}
        className="mt-4 text-xs text-gray-500 hover:text-gray-700"
      >
        閉じる
      </button>
    </div>
  );
};
