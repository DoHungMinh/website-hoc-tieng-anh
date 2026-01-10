import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  category: string;
}

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: string[];
  onFilterToggle: (filterId: string) => void;
  filterOptions: FilterOption[];
  placeholder?: string;
  colorTheme?: 'indigo' | 'green';
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterToggle,
  filterOptions,
  placeholder = 'Tìm kiếm theo cấp độ, độ khó, chủ đề...',
  colorTheme = 'indigo',
}) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const getThemeClasses = () => {
    if (colorTheme === 'green') {
      return {
        inputFocus: 'focus:border-green-600 focus:ring-green-500',
        buttonBorder: 'border-green-600 text-green-700 hover:bg-green-50',
        badge: 'bg-green-600',
        filterTag: 'bg-green-50 text-green-700',
        checkbox: 'text-green-600 focus:ring-green-500',
      };
    }
    return {
      inputFocus: 'focus:border-indigo-600 focus:ring-indigo-500',
      buttonBorder: 'border-indigo-600 text-indigo-700 hover:bg-indigo-50',
      badge: 'bg-indigo-600',
      filterTag: 'bg-indigo-50 text-indigo-700',
      checkbox: 'text-indigo-600 focus:ring-indigo-500',
    };
  };

  const themeClasses = getThemeClasses();

  // Group filters by category
  const groupedFilters = filterOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, FilterOption[]>);

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 ${themeClasses.inputFocus} focus:ring-2 focus:ring-opacity-20 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400`}
            />
          </div>
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`relative flex items-center gap-2 px-6 py-3.5 bg-white border-2 ${themeClasses.buttonBorder} rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Lọc</span>
            {activeFilters.length > 0 && (
              <span className={`absolute -top-2 -right-2 ${themeClasses.badge} text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg`}>
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Filter Dropdown Menu */}
          {showFilterMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterMenu(false)}
              ></div>

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
                    {activeFilters.length > 0 && (
                      <button
                        onClick={() => {
                          activeFilters.forEach((filterId) => onFilterToggle(filterId));
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {/* Filter Groups */}
                  {Object.entries(groupedFilters).map(([category, options]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {options.map((option) => {
                          const isActive = activeFilters.includes(option.id);
                          return (
                            <label
                              key={option.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => onFilterToggle(option.id)}
                                className={`h-4 w-4 ${themeClasses.checkbox} border-gray-300 rounded focus:ring-offset-0 cursor-pointer`}
                              />
                              <span className="text-sm text-gray-700 font-medium">
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Filters Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filterId) => {
            const filter = filterOptions.find((opt) => opt.id === filterId);
            if (!filter) return null;
            return (
              <span
                key={filterId}
                className={`inline-flex items-center gap-2 px-3 py-1.5 ${themeClasses.filterTag} rounded-full text-sm font-medium`}
              >
                {filter.label}
                <button
                  onClick={() => onFilterToggle(filterId)}
                  className="hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
