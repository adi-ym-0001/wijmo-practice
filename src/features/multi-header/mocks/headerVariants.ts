export function getFundData() {
  return [
    {
      name: 'Aventium',
      currency: 'USD',
      fundType: '株式型',
      region: '北米',
      perf: { ytd: 0.0523, m1: 0.0142, m6: 0.0443, m12: 0.0743 },
      alloc: { stock: 0.17, bond: 0.32, cash: 0.36, other: 0.15, realEstate: 0.05 },
      note: '安定運用',
      setupDate: new Date(2018, 4, 1),
      amount: 1200000,
      achievement: 0.87,
    },
    {
      name: 'Brillion',
      currency: 'EUR',
      fundType: '債券型',
      region: '欧州',
      perf: { ytd: 0.0343, m1: 0.043, m6: 0.0244, m12: 0.0543 },
      alloc: { stock: 0.61, bond: 0.8, cash: 0.9, other: 0.22, realEstate: 0.1 },
      note: '高リスク',
      setupDate: new Date(2019, 6, 15),
      amount: 950000,
      achievement: 0.78,
    },
    {
      name: 'Cortollix',
      currency: 'YEN',
      fundType: 'バランス型',
      region: 'アジア',
      perf: { ytd: 0.0522, m1: 0.0143, m6: 0.0458, m12: 0.0732 },
      alloc: { stock: 0.66, bond: 0.09, cash: 0.19, other: 0.06, realEstate: 0.2 },
      note: '分散投資',
      setupDate: new Date(2020, 1, 10),
      amount: 780000,
      achievement: 0.92,
    },
    // グループを分けるために追加
    {
      name: 'Zenith',
      currency: 'USD',
      fundType: '株式型',
      region: '北米',
      perf: { ytd: 0.045, m1: 0.02, m6: 0.03, m12: 0.06 },
      alloc: { stock: 0.5, bond: 0.2, cash: 0.2, other: 0.05, realEstate: 0.05 },
      note: '成長重視',
      setupDate: new Date(2021, 2, 5),
      amount: 1500000,
      achievement: 0.95,
    },
  ];
}



export function getFundColumns() {
  return [
    {
      header: 'Name',
      binding: 'name',
      width: '2*',
    },
    {
      header: 'Curr',
      binding: 'currency',
      width: '*',
    },
    {
      header: 'Performance',
      columns: [
        {
          header: 'Return',
          columns: [
            {
              header: 'Short Term',
              columns: [
                { header: '1 M', binding: 'perf_m1', format: 'p2', width: '*', role: 'performance' },
                { header: '6 M', binding: 'perf_m6', format: 'p2', width: '*', role: 'performance' },
              ],
            },
            {
              header: 'Long Term',
              columns: [
                { header: 'YTD', binding: 'perf_ytd', format: 'p2', width: '*', role: 'performance' },
                { header: '12 M', binding: 'perf_m12', format: 'p2', width: '*', role: 'performance' },
              ],
            },
          ],
        },
      ],
    },
    {
      header: 'Allocation',
      columns: [
        {
          header: 'Asset Class',
          columns: [
            { header: 'Stocks', binding: 'alloc_stock', format: 'p0', width: '*', role: 'allocation' },
            { header: 'Bonds', binding: 'alloc_bond', format: 'p0', width: '*', role: 'allocation' },
            { header: 'Cash', binding: 'alloc_cash', format: 'p0', width: '*', role: 'allocation' },
            { header: 'Other', binding: 'alloc_other', format: 'p0', width: '*', role: 'allocation' },
            { header: 'Real Estate', binding: 'alloc_realEstate', format: 'p0', width: '*', role: 'allocation' },
          ],
        },
      ],
    },
    { header: 'Note', binding: 'note', dataType: 'String', width: '*', role: 'meta' },
    {
      header: 'Setup Date',
      binding: 'setupDate',
      dataType: 'Date',
      format: 'yyyy/MM/dd',
      width: '*',
    },
    {
      header: 'Amount (円)',
      binding: 'amount',
      dataType: 'Number',
      format: 'n0',
      width: '*',
    },
    {
      header: 'Achievement (%)',
      binding: 'achievement',
      dataType: 'Number',
      format: 'p0',
      width: '*',
    },
  ];
}

