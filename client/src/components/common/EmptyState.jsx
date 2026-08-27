const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
      {Icon && <Icon className="w-12 h-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
