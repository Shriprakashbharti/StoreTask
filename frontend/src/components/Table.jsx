const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export default Table