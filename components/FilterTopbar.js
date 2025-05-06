// components/FilterTopBar.js
import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AsyncCreatableSelect from 'react-select/async-creatable';
import Select from 'react-select'; // For standard sync select, if preferred over native
import { useTheme } from 'next-themes';

// Helper function (assuming it might be used by parent components for loadOptions)
// const getYearMonthString = (date) => { ... }; // (already defined in previous step, keep if needed globally or move to utils)

export default function FilterTopbar({
    filterConfig,
    availableFilters,
    selectedFilters,
    onFilterChange,
    onDateChange,
    loading = false,
    startDate,
    endDate,
}) {

    const handleSelectChange = (filterKey, value) => {
        onFilterChange(filterKey, value);
    };

    const handleReactSelectChange = (filterKey, selectedOption) => {
        onFilterChange(filterKey, selectedOption ? selectedOption.value : null);
    };

    const handleDatePickerChange = (filterKey, dateObject) => {
        onDateChange(filterKey, dateObject);
    };

	const { resolvedTheme } = useTheme();

    // Styles for react-select to somewhat match Tailwind inputs
    const customReactSelectStyles = (isDarkMode = false) => ({
        control: (provided, state) => ({
            ...provided,
            minHeight: '42px', // Matches p-2 border height roughly
            borderColor: state.isFocused ? (isDarkMode ? '#5A67D8' : '#4A5568') : (isDarkMode ? '#4A5568' : '#D1D5DB'), // Tailwind gray-300, focus: indigo-500
            backgroundColor: isDarkMode ? '#2D3748' : 'white', // Tailwind gray-800 for dark
            boxShadow: state.isFocused ? (isDarkMode ? '0 0 0 1px #5A67D8' : '0 0 0 1px #4A5568') : 'none',
            '&:hover': {
                borderColor: state.isFocused ? (isDarkMode ? '#5A67D8' : '#4A5568') : (isDarkMode ? '#718096' : '#A0AEC0'), // Tailwind gray-500 on hover
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#2D3748' : 'white',
            zIndex: 20, // Ensure dropdown is above other content
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? (isDarkMode ? '#4A5568' : '#EBF4FF') : state.isFocused ? (isDarkMode ? '#4A5568' : '#F7FAFC') : (isDarkMode ? '#2D3748' : 'white'),
            color: isDarkMode ? 'white' : 'black',
            '&:active': {
                backgroundColor: isDarkMode ? '#3D4852' : '#EBF4FF',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDarkMode ? 'white' : 'black',
        }),
        input: (provided) => ({
            ...provided,
            color: isDarkMode ? 'white' : 'black',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDarkMode ? '#A0AEC0' : '#A0AEC0', // Tailwind gray-400
        }),
        // Add more styles for multiValue, clearIndicator, dropdownIndicator etc. if needed
    });
    
    // Detect dark mode (basic example, adapt if you have a theme context)
    const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');


    if (loading) {
        return (
            <div className="p-3 mb-5 bg-gray-100 border-b border-gray-300 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                Loading filters...
            </div>
        );
    }

    if (!filterConfig || filterConfig.length === 0) {
        return null;
    }

    return (
        <div className="p-4 bg-card text-card-foreground rounded-lg shadow mb-6 flex flex-wrap items-end gap-x-6 gap-y-4">
            {filterConfig.map(filter => {
                const { key, label, type, optionsKey, placeholder, loadOptions, creatable } = filter;

                if (type === 'select') { // For standard, relatively small dropdowns like Org, Title
                    const effectiveOptionsKey = optionsKey || key;
                    const filterOptions = availableFilters[effectiveOptionsKey] || [];
                    // For react-select, value should be an object or null
                    const currentValueObj = filterOptions.find(opt => opt.value === selectedFilters[key]);

                    return (
                        <div key={key} className="flex flex-col min-w-[180px] sm:min-w-[200px] flex-1 sm:flex-none">
                            <label htmlFor={`${key}-filter`} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
                            <Select
                                id={`${key}-filter`}
                                options={[{ value: 'all', label: `All ${label.replace(':', '').trim()}` }, ...filterOptions]}
                                value={currentValueObj || ({ value: 'all', label: `All ${label.replace(':', '').trim()}` })}
                                onChange={(selectedOption) => handleReactSelectChange(key, selectedOption)}
                                placeholder={placeholder || `Select ${label.replace(':', '').trim()}`}
                                styles={customReactSelectStyles(isDarkMode)}
                                isClearable={filter.isClearable !== undefined ? filter.isClearable : true}
                            />
                        </div>
                    );
                } else if (type === 'month') {
                    const isStartDate = key === 'startMonth' || key === 'startDate';
                    const selectedDateValue = isStartDate ? startDate : endDate;

                    return (
                        <div key={key} className="flex flex-col min-w-[150px] sm:min-w-[160px] flex-1 sm:flex-none">
                            <label htmlFor={`${key}-filter`} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
                            <DatePicker
                                selected={selectedDateValue}
                                onChange={(date) => handleDatePickerChange(key, date)}
                                selectsStart={isStartDate ? true : undefined}
                                selectsEnd={!isStartDate ? true : undefined}
                                startDate={isStartDate ? undefined : startDate}
                                endDate={!isStartDate ? undefined : endDate}
                                minDate={isStartDate ? undefined : startDate}
                                maxDate={!isStartDate ? undefined : endDate}
                                dateFormat="yyyy-MM"
                                showMonthYearPicker
                                isClearable
                                placeholderText={placeholder || "Select month"}
                                className="w-full p-2 border border-input rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                wrapperClassName="w-full"
                                id={`${key}-filter`}
                            />
                        </div>
                    );
                } else if (type === 'async_creatable_select') { // For Person filter or similar large async lists
                     const currentValueObj = selectedFilters[key] ? { value: selectedFilters[key], label: selectedFilters[`${key}_label`] || selectedFilters[key] } : null;


                    return (
                        <div key={key} className="flex flex-col min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-none">
                            <label htmlFor={`${key}-filter`} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
                            <AsyncCreatableSelect
                                id={`${key}-filter`}
                                cacheOptions
                                defaultOptions // Consider loading initial set of options or popular choices
                                loadOptions={loadOptions} // This function will be defined in the parent page
                                value={currentValueObj}
                                onChange={(selectedOption) => {
                                    // When an option is selected or created
                                    if (selectedOption) {
                                        onFilterChange(key, selectedOption.value);
                                        // If the label might be different from value (e.g. new item created), store it for display
                                        onFilterChange(`${key}_label`, selectedOption.label);
                                    } else {
                                        onFilterChange(key, null);
                                        onFilterChange(`${key}_label`, null);
                                    }
                                }}
                                onCreateOption={creatable && filter.onCreateOption ? (inputValue) => filter.onCreateOption(key, inputValue) : undefined}
                                isClearable
                                placeholder={placeholder || `Search or create ${label.replace(':', '').trim()}`}
                                styles={customReactSelectStyles(isDarkMode)}
                                // menuPortalTarget={document.body} // Useful if parent clips menu
                            />
                        </div>
                    );
                }

                console.warn(`FilterTopbar: Unsupported filter type "${type}" for key "${key}"`);
                return null;
            })}
        </div>
    );
}