import { useState } from "react";
import { Toaster } from "sonner";
import { Button } from "./components/ui/button";
import { Grid } from "./features/grid/components/Grid";
import { HierarchicalGrid } from "./features/multi-header/components/HierarchicalGrid";
import { getFundColumns, getFundData } from "./features/multi-header/mocks/headerVariants";

export function App() {
  const [showGrid, setShowGrid] = useState(false);
  const [showMaltHeader, setShowMaltHeader] = useState(false);
  
  return (
    <>
    <div>
      <Button
        onClick={() => {
          setShowGrid(true)
          setShowMaltHeader(false)
        }}
      >
        エラーメッセージ表示グリッド
      </Button>
      <Button
        onClick={() => {
          setShowGrid(false)
          setShowMaltHeader(true)
        }}
      >
        階層付きヘッダーグリッド
      </Button>
    </div>

    {/* エラーメッセージ表示グリッド */}
    {showGrid && (
      <div>
        <Grid />
        <Toaster richColors position="top-right" />
        <Toaster position="bottom-right" />
      </div>
    )}
    {/* 階層付きヘッダーグリッド */}
    {showMaltHeader && (
      <div>
        <HierarchicalGrid
          gridId="FinancialGrid"
          columnGroups={getFundColumns()}
          itemsSource={getFundData()}
        />
      </div>
    )}
    </>
  );
}