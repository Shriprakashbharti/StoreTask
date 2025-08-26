const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  )
}

export default Card