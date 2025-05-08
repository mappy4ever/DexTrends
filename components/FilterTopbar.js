// components/FilterTopbar.js
import React from 'react';
import DatePicker from 'react-datepicker';
import AsyncCreatableSelect from 'react-select/async-creatable';
import Select from 'react-select';
import { useTheme } from 'next-themes';

export default function FilterTopbar({
    filterConfig,
    availableFilters, // e.g., { org: [{value: '1', label: 'Org A'}], title: [...] }
    selectedFilters,  // e.g., { org: '1', title: 'Manager', startMonth: '2023-01', ... }
    onFilterChange,   // (filterKey, value) => void
    onDateChange,     // (dateKey {'startDate'|'endDate'}, dateObject) => void
    loading = false,
    startDate,        // Date object
    endDate,          // Date object
}) {
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === 'dark';

    const handleReactSelectChange = (filterKey, selectedOptionOrOptions) => {
        if (Array.isArray(selectedOptionOrOptions)) {
            onFilterChange(filterKey, selectedOptionOrOptions.map(opt => opt.value));
        } else {
            // For single select, react-select passes the selected option object or null
            // The consuming page's onFilterChange will handle this object or null value.
            // Let's pass the whole object or null to give more context to the parent.
            // Parent (pages/orgs.js handleFilterChange) is already set up to expect object or value or null.
            onFilterChange(filterKey, selectedOptionOrOptions); 
        }
    };
    
    const handleReactSelectCreate = (filterKey, inputValue, isMulti = false) => {
        // Simplified: Assuming parent onFilterChange can handle a new string value directly
        // or the parent's onCreateOption handles creating the option structure.
        console.log(`FilterTopbar: New option created for ${filterKey}:`, inputValue);
        if (isMulti) {
            const currentValues = Array.isArray(selectedFilters[filterKey]) ? selectedFilters[filterKey] : [];
            // This assumes the new value should be added to an array of primitive values (IDs)
            // If selectedFilters[filterKey] stores objects, this needs adjustment.
            onFilterChange(filterKey, [...currentValues, inputValue]); 
        } else {
            onFilterChange(filterKey, inputValue); // For single creatable, pass the raw input value
        }
    };


    const customReactSelectStyles = (isDark) => ({
        control: (provided, state) => ({
            ...provided,
            minHeight: '42px', // Approx h-10 or py-2 + border
            backgroundColor: `var(--color-input-background)`,
            borderColor: state.isFocused ? `var(--color-primary-default)` : `var(--color-input-border)`,
            boxShadow: state.isFocused ? `0 0 0 1px var(--color-primary-default)` : 'none',
            borderRadius: `var(--radius-md)`, // from globals.css or tailwind config
            '&:hover': {
                borderColor: `var(--color-primary-default)`,
            },
            fontSize: '0.875rem', // text-sm
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: `var(--color-surface-default)`,
            borderColor: `var(--color-border-default)`,
            borderWidth: '1px',
            borderRadius: `var(--radius-md)`,
            boxShadow: `var(--shadow-app)`, // or specific shadow for dropdowns
            zIndex: 50, // High z-index for dropdowns
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? `var(--color-primary-default)`
                : state.isFocused
                ? `var(--color-primary-default)/0.1` // primary with low opacity
                : 'transparent',
            color: state.isSelected ? `var(--color-primary-foreground)` : `var(--color-input-text)`,
            '&:active': {
                backgroundColor: `var(--color-primary-default)/0.2`,
            },
            fontSize: '0.875rem',
            padding: '0.5rem 0.75rem', // py-2 px-3
        }),
        singleValue: (provided) => ({
            ...provided,
            color: `var(--color-input-text)`,
        }),
        input: (provided) => ({
            ...provided,
            color: `var(--color-input-text)`,
            margin: '0px', // Reset margin
            paddingBottom: '0px', // Reset padding
            paddingTop: '0px',    // Reset padding
        }),
        placeholder: (provided) => ({
            ...provided,
            color: `var(--color-input-placeholder)`,
        }),
        indicatorSeparator: () => ({ display: 'none' }), // Hide separator
        dropdownIndicator: (provided) => ({
            ...provided,
            color: `var(--color-text-muted)`,
            '&:hover': { color: `var(--color-text-body)` },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: `var(--color-text-muted)`,
            '&:hover': { color: `var(--color-text-body)` },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: `var(--color-primary-default)/0.1`,
            borderRadius: `var(--radius-sm)`,
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: `var(--color-primary-default)`, // Text color for selected item
            fontSize: '0.875rem',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: `var(--color-primary-default)`,
            '&:hover': {
                backgroundColor: `var(--color-primary-default)/0.2`,
                color: `var(--color-primary-darker)`,
            },
        }),
    });

    if (loading) {
        return (
            <div className="p-4 mb-6 bg-surface rounded-app-lg shadow-app text-center text-foreground-muted">
                Loading filters...
            </div>
        );
    }

    if (!filterConfig || filterConfig.length === 0) {
        return null; // No filters configured
    }

    return (
        <div className="p-4 bg-card text-card-foreground rounded-app-lg shadow-app mb-6 flex flex-wrap items-end gap-x-4 gap-y-4 z-20">
            {filterConfig.map(filter => {
                // Destructure 'options' from filter as 'filterSpecificOptions'
                const { 
                    key, label, type, optionsKey, placeholder, loadOptions, 
                    isMulti = false, creatable = false, onCreateOption: parentOnCreateOption, 
                    options: filterSpecificOptions, // these are options like [{value, label}, ...]
                    isLoading: itemIsLoading // loading state for individual filter item
                } = filter;

                if (type === 'select' || type === 'async_select' || type === 'async_creatable_select') {
                    const currentFilterValueFromState = selectedFilters[key]; // This is the ID string from pages/orgs.js state

                    // Determine options for 'select' type, prioritizing filterSpecificOptions
                    const optionsForSimpleSelect = type === 'select'
                        ? (filterSpecificOptions || availableFilters[optionsKey || key] || [])
                        : undefined; // Not used for async types here

                    let valueForReactSelect;
                    if (isMulti) {
                        // Logic for multi-select value (array of objects)
                        const currentArray = Array.isArray(currentFilterValueFromState) ? currentFilterValueFromState : [];
                        valueForReactSelect = currentArray.map(val => {
                            const foundOpt = (optionsForSimpleSelect || []).find(opt => opt.value === val) || 
                                           (type !== 'select' ? null : undefined); // For async, label might not be known yet
                            return { value: val, label: foundOpt ? foundOpt.label : val };
                        });
                    } else {
                        // Logic for single-select value (object or null)
                        if (currentFilterValueFromState) {
                            const foundOpt = (optionsForSimpleSelect || []).find(opt => opt.value === currentFilterValueFromState);
                            // For async_select, if the initial value's label isn't in defaultOptions,
                            // react-select might show the value until options load.
                            // Or, the parent could pass a selectedFilters[`${key}_label`] if absolutely needed.
                            // But for simple 'select', optionsForSimpleSelect should contain the label.
                            valueForReactSelect = {
                                value: currentFilterValueFromState,
                                label: foundOpt ? foundOpt.label : (type === 'async_select' || type === 'async_creatable_select' ? currentFilterValueFromState : `ID: ${currentFilterValueFromState}`) // Fallback label
                            };
                        } else {
                            valueForReactSelect = null;
                        }
                    }
                    
                    const commonSelectProps = {
                        id: `${key}-filter`,
                        value: valueForReactSelect,
                        onChange: (selected) => handleReactSelectChange(key, selected), // Pass the whole selected object or null
                        isClearable: filter.isClearable !== undefined ? filter.isClearable : true,
                        isMulti: isMulti,
                        placeholder: placeholder || `Select ${label.replace(':', '').trim()}`,
                        styles: customReactSelectStyles(isDarkMode),
                        className: "text-sm",
                        classNamePrefix: "react-select",
                        isLoading: itemIsLoading, // Use individual item loading state
                    };

                    return (
                        <div key={key} className="flex flex-col min-w-[180px] sm:min-w-[200px] flex-1 basis-full sm:basis-auto">
                            <label htmlFor={`${key}-filter`} className="block text-sm font-medium text-foreground-muted mb-1.5">{label}</label>
                            {type === 'select' && (
                                <Select
                                    {...commonSelectProps}
                                    options={optionsForSimpleSelect}
                                />
                            )}
                            {(type === 'async_select' || type === 'async_creatable_select') && (
                                <AsyncCreatableSelect
                                    {...commonSelectProps}
                                    isCreatable={type === 'async_creatable_select' && creatable}
                                    loadOptions={loadOptions}
                                    onCreateOption={
                                        type === 'async_creatable_select' && creatable
                                        ? (inputValue) => {
                                            if (parentOnCreateOption) parentOnCreateOption(key, inputValue);
                                            else handleReactSelectCreate(key, inputValue, isMulti);
                                          }
                                        : undefined
                                    }
                                    defaultOptions // Consider true or an initial list for async
                                    cacheOptions   // For async
                                />
                            )}
                        </div>
                    );

                } else if (type === 'month') {
                    const isStartDateKey = key === 'startMonth' || key === 'startDate';
                    const selectedDateValue = isStartDateKey ? startDate : endDate;

                    return (
                        <div key={key} className="flex flex-col min-w-[150px] sm:min-w-[160px] flex-1 basis-full sm:basis-auto">
                            <label htmlFor={`${key}-filter`} className="block text-sm font-medium text-foreground-muted mb-1.5">{label}</label>
                            <DatePicker
                                selected={selectedDateValue instanceof Date && !isNaN(selectedDateValue) ? selectedDateValue : null}
                                onChange={(date) => onDateChange(isStartDateKey ? 'startDate' : 'endDate', date)}
                                selectsStart={isStartDateKey}
                                selectsEnd={!isStartDateKey}
                                startDate={isStartDateKey ? null : startDate} // For selectsEnd, provide startDate
                                endDate={!isStartDateKey ? null : endDate}   // For selectsStart, provide endDate
                                minDate={isStartDateKey ? null : startDate} // Prevent end before start
                                maxDate={!isStartDateKey ? null : (filter.allowFutureDates ? null : new Date())} // Prevent start after end, optionally allow future
                                dateFormat="MMM yyyy" // Changed format for better readability
                                showMonthYearPicker
                                isClearable
                                placeholderText={placeholder || "Pick a month"}
                                className="input w-full" // Use the .input class from globals.css
                                wrapperClassName="w-full"
                                id={`${key}-filter`}
                                popperPlacement="bottom-start"
                            />
                        </div>
                    );
                }

                console.warn(`FilterTopbar: Unsupported filter type "${type}" for key "${key}". Ensure type is 'select', 'async_select', 'async_creatable_select', or 'month'.`);
                return null;
            })}
        </div>
    );
}