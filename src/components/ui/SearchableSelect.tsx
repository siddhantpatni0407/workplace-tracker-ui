import React from 'react';
import Select, { SingleValue, ActionMeta, components, InputActionMeta } from 'react-select';

export interface Option {
  value: string;
  label: string;
  [key: string]: any;
}

interface SearchableSelectProps<T extends Option = Option> {
  options: T[];
  value?: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  isClearable?: boolean;
  noOptionsMessage?: string;
  className?: string;
  onInputChange?: (inputValue: string, actionMeta: InputActionMeta) => void;
  menuPortalTarget?: HTMLElement | null;
}

const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? '#007bff' : '#ced4da',
    '&:hover': {
      borderColor: '#007bff'
    },
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : 'none',
    minHeight: '38px'
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#007bff'
      : state.isFocused
      ? '#e9ecef'
      : 'white',
    color: state.isSelected ? 'white' : '#495057',
    ':active': {
      backgroundColor: '#007bff',
      color: 'white'
    }
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999
  })
};

const LoadingIndicator = (props: any) => {
  return (
    <components.LoadingIndicator {...props}>
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </components.LoadingIndicator>
  );
};

const SearchableSelect = <T extends Option = Option>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  isLoading = false,
  isDisabled = false,
  isClearable = true,
  noOptionsMessage = "No options available",
  className = "",
  onInputChange,
  menuPortalTarget = document.body
}: SearchableSelectProps<T>) => {
  const handleChange = (
    selectedOption: SingleValue<T>,
    actionMeta: ActionMeta<T>
  ) => {
    onChange(selectedOption);
  };

  const handleInputChange = (
    inputValue: string,
    actionMeta: InputActionMeta
  ) => {
    if (onInputChange) {
      onInputChange(inputValue, actionMeta);
    }
  };

  return (
    <div className={className}>
      <Select<T>
        options={options}
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        placeholder={placeholder}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={true}
        styles={customStyles}
        components={{ LoadingIndicator }}
        noOptionsMessage={() => noOptionsMessage}
        menuPortalTarget={menuPortalTarget}
        menuPosition="fixed"
        filterOption={(option, inputValue) => {
          if (!inputValue) return true;
          const searchValue = inputValue.toLowerCase();
          return (
            option.label.toLowerCase().includes(searchValue) ||
            option.value.toLowerCase().includes(searchValue)
          );
        }}
      />
    </div>
  );
};

export default SearchableSelect;