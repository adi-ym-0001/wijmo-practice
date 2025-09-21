import { toast } from "sonner";
import type { CellError } from "./Grid";

/**
 * エラー一覧をSonnerトーストで表示し、セルジャンプ機能を提供する
 *
 * @param errors - エラー一覧
 * @param jumpToCell - セルジャンプ関数（row, col）を受け取る
 */
export const showErrorToast = (
  errors: CellError[],
  jumpToCell: (row: number, col: number) => void
) => {
  let current = 0;

  toast.error("入力エラーがあります", {
    description: (
      <div className="space-y-2 text-sm">
        <ul className="space-y-1">
          {errors.slice(0, 3).map((err, i) => (
            <li key={i}>
              <button
                onClick={() => jumpToCell(err.row, err.col)}
                className="text-red-600 underline"
              >
                行{err.row + 1}・列{err.col + 1}: {err.message}
              </button>
            </li>
          ))}
        </ul>
        {errors.length > 3 && (
          <p className="text-xs text-gray-500">他 {errors.length - 3} 件のエラーがあります</p>
        )}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              jumpToCell(errors[current].row, errors[current].col);
              current = (current + 1) % errors.length;
            }}
            className="text-blue-600 underline text-xs"
          >
            次のエラーへ
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="text-gray-500 underline text-xs"
          >
            閉じる
          </button>
        </div>
      </div>
    ),
    position: "bottom-right",
    duration: Infinity,
  });
};
