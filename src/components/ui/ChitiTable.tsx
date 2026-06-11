interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface ChitiTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  keyExtractor: (item: T) => string;
}

export default function ChitiTable<T>({
  columns,
  data,
  onRowClick,
  emptyState,
  keyExtractor,
}: ChitiTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-surface-1 border border-white/10 rounded-xl p-12 text-center">
        {emptyState || (
          <div className="text-text-muted text-sm">No data available</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-text-muted">
            {columns.map((col) => (
              <th key={col.key} className={`text-left p-4 font-medium ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={`border-b border-white/5 last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-surface-2 transition-colors" : ""
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`p-4 ${col.className || ""}`}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
