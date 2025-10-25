export const ListingsDisplay = ({ listings }) => {
  const displayData = listings || [];

  return (
    <div className="text-left text-white max-h-96 overflow-y-auto">
      {displayData.length > 0 ? (
        displayData.map((item) => (
          <div key={item.listingId} className="p-4 border-b border-gray-600">
            <h4 className="font-bold text-lg">🌳 {item.projectName}</h4>
            <p className="text-sm text-gray-300">
              {item.projectType} • {item.country} • {item.vintage} Vintage
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-green-400">
                💰 {parseFloat(item.pricePerCredit).toFixed(2)} USDC per credit
              </span>
              <span className="text-gray-400">
                📦 {item.quantityAvailable} available
              </span>
            </div>
          </div>
        ))
      ) : (
        <p>No listings found.</p>
      )}
    </div>
  );
};