import * as wijmo from '@mescius/wijmo';
import { CollectionView } from '@mescius/wijmo';
import '@mescius/wijmo.cultures/wijmo.culture.ja';
import * as wjGrid from '@mescius/wijmo.grid';
import * as wjcGrid from '@mescius/wijmo.react.grid';
import '@mescius/wijmo.styles/wijmo.css';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { fetchData, fetchHeaderDefinition } from '../mocks/mockApi';
import '../styles/wijmo.css';

type CellError = {
  row: number;
  col: number;
  message: string;
};

const MAX_RECORDS = 10000;
const PAGE_SIZE = 40;

export const Grid = () => {
  const [dataView, setDataView] = useState<CollectionView | undefined>(undefined);
  const [errors, setErrors] = useState<CellError[]>([]);
  const [open, setOpen] = useState(false);
  const gridRef = useRef<any>(null);
  const dataRef = useRef<any[]>([]);
  const layout = fetchHeaderDefinition();

const handleSave = () => {
  const newErrors = validate();
  setErrors(newErrors);

  if (newErrors.length > 0) {
    toast.error(`保存失敗：${newErrors.length}件の入力エラーがあります`, {
      description: 'セルを確認してください',
      duration: 5000,
    });
  } else {
    toast.success('保存完了', {
      description: 'すべてのデータが正常です',
      duration: 3000,
    });
  }
};


  const generateColumns = () => {
    const cols: React.ReactElement[] = [];
    for (const group of layout) {
      for (const cell of group.cells) {
        if (cell.binding) {
          cols.push(
            <wjcGrid.FlexGridColumn
              key={cell.binding}
              binding={cell.binding}
              header={cell.header}
              align={cell.align ?? 'left'}
              allowSorting={false}
            />
          );
        }
      }
    }
    return cols;
  };

  useEffect(() => {
    const initialData = fetchData(0, PAGE_SIZE);
    dataRef.current = initialData;
    const view = new CollectionView(dataRef.current, {
      groupDescriptions: ['category'],
    });
    setDataView(view);
  }, []);

  useEffect(() => {
  const grid = gridRef.current?.control;
  if (!grid) return;

  grid.formatItem.addHandler((s, e) => {
    if (e.panel === s.cells) {
      const err = errors.find((er) => er.row === e.row && er.col === e.col);
      if (err) {
        e.cell.style.backgroundColor = '#ffe4e1'; // ピンク背景
      } else {
        e.cell.style.backgroundColor = ''; // 通常状態に戻す
      }
    }
  });

  const tip = new wijmo.Tooltip();
  let rng: wijmo.grid.CellRange | null = null;

  const mouseMoveHandler = (e: MouseEvent) => {
    const ht = grid.hitTest(e.pageX, e.pageY);
    if (!rng || !ht.range.equals(rng)) {
      if (ht.cellType === wjGrid.CellType.Cell) {
        const err = errors.find((er) => er.row === ht.row && er.col === ht.col);
        if (err) {
          rng = ht.range;
          const cellElement = document.elementFromPoint(e.clientX, e.clientY);
          const cellBounds = grid.getCellBoundingRect(ht.row, ht.col);
          const data = wijmo.escapeHtml(err.message);

          // 安全に表示するためのチェック
          if (cellElement && cellElement.className.indexOf('wj-cell') > -1) {
            tip.show(grid.hostElement, data, cellBounds);
          }
        } else {
          tip.hide();
          rng = null;
        }
      } else {
        tip.hide();
        rng = null;
      }
    }
  };

  const mouseOutHandler = () => {
    tip.hide();
    rng = null;
  };

  grid.hostElement.addEventListener('mousemove', mouseMoveHandler);
  grid.hostElement.addEventListener('mouseout', mouseOutHandler);

  return () => {
    grid.hostElement.removeEventListener('mousemove', mouseMoveHandler);
    grid.hostElement.removeEventListener('mouseout', mouseOutHandler);
    tip.dispose();
  };
}, [errors]);

  const validate = (): CellError[] => {
    const grid = gridRef.current?.control;
    const view = grid?.itemsSource as CollectionView;
    const errs: CellError[] = [];

    view.items.forEach((item, row) => {
      if (!item.product) errs.push({ row, col: 1, message: '商品名が未入力です' });
      if (item.sales < 100) errs.push({ row, col: 5, message: '売上が低すぎます' });
      if (item.rating === 'D') errs.push({ row, col: 7, message: '評価が低すぎます' });
    });

    return errs;
  };

  const handleScroll = (grid: any) => {
    const bottomRow = grid.viewRange?.bottomRow ?? 0;
    const totalRows = grid.rows.length;

    if (bottomRow >= totalRows - 1 && dataRef.current.length < MAX_RECORDS) {
      const more = fetchData(dataRef.current.length, PAGE_SIZE);
      dataRef.current.push(...more);

      const updatedView = new CollectionView(dataRef.current, {
        groupDescriptions: ['category'],
      });
      setDataView(updatedView);
    }
  };

  const jumpToCell = (row: number, col: number) => {
    const grid = gridRef.current?.control;
    if (grid) {
      grid.select(row, col);
      grid.scrollIntoView(row, col);
    }
  };

  return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">商品一覧</h1>

        <wjcGrid.FlexGrid
          ref={gridRef}
          itemsSource={dataView}
          scrollPositionChanged={(grid) => handleScroll(grid)}
          headersVisibility="Column"
          allowMerging="ColumnHeaders"
          showGroups={true}
          allowSorting={false}
        >
          {generateColumns()}
        </wjcGrid.FlexGrid>

        <div className="mt-4 flex gap-4 items-center">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            保存
          </button>

          
        </div>
      </div>
  );
};