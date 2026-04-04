const Table = ({ data, columns, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm text-gray-700">
                    {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;