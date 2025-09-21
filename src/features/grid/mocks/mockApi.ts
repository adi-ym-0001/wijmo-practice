const MAX_RECORDS = 10000;

export function fetchData(offset: number, count: number): any[] {
  const categories = ['電子機器', '日用品', '玩具'];
  const result: any[] = [];
  for (let i = 0; i < count && (offset + i) < MAX_RECORDS; i++) {
    const category = categories[i % categories.length];
    result.push({
      category,
      product: `商品${offset + i}`,
      category1: `詳細${(offset + i) % 3 + 1}-1`,
      category2: `詳細${(offset + i) % 3 + 1}-2`,
      category3: `詳細${(offset + i) % 3 + 1}-3`,
      sales: Math.round(Math.random() * 1000),
      profit: Math.round(Math.random() * 500),
      rating: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
    });
  }
  return result;
}

// データ行のレイアウト定義
export function getLayoutDefinition() {
  return [
    {
      header: '商品', cells: [
        { binding: 'product', header: '商品' }
      ]
    },
    {
      colspan: 3, header: 'カテゴリ詳細', align: 'center', cells: [
        { binding: 'category1', header: 'カテゴリ詳細1' },
        { binding: 'category2', header: 'カテゴリ詳細2' },
        { binding: 'category3', header: 'カテゴリ詳細3' }
      ]
    },
    {
      colspan: 2, header: '業績情報', align: 'center', cells: [
        { binding: 'sales', header: '売上' },
        { binding: 'profit', header: '利益' }
      ]
    },
    {
      header: '評価', cells: [
        { binding: 'rating', header: '評価' }
      ]
    }
  ];
}

// グリッド上部に追加で表示されるヘッダー行（ラベル行）
export function fetchHeaderDefinition(): any[] {
  return [
    {
      header: '商品', cells: [
        { binding: 'product', header: '商品' }
      ]
    },
    {
      cells: [
        { header: 'カテゴリ詳細', align: 'center', colspan: 3 },
        { binding: 'category1', header: 'カテゴリ詳細1' },
        { binding: 'category2', header: 'カテゴリ詳細2' },
        { binding: 'category3', header: 'カテゴリ詳細3' }
      ]
    },
    {
      cells: [
        { header: '業績情報', align: 'center', colspan: 2 },
        { binding: 'sales', header: '売上' },
        { binding: 'profit', header: '利益' }
      ]
    },
    {
      header: '評価', cells: [
        { binding: 'rating', header: '評価' }
      ]
    }
  ];
}