const Select = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } rounded-xl bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default Select