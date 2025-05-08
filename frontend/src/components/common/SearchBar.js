import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon } from './Icons';

/**
 * Reusable search bar component with suggestions dropdown
 */
const SearchBar = ({
  placeholder = 'Search...',
  suggestions = [],
  onSearch,
  onSearchChange,
  onSuggestionClick,
  value = '',
  className = '',
  style = {}
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current !== event.target
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
    setShowSuggestions(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelection = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    setShowSuggestions(false);
  };

  return (
    <div style={{ 
      position: 'relative',
      ...style
    }} className={`search-bar-container ${className}`}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: '100%'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          style={{
            width: '100%',
            padding: '12px 20px 12px 40px',
            borderRadius: '25px',
            border: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
        />
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          color: '#888'
        }}>
          <SearchIcon />
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 9999,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                ':hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
              onClick={() => handleSuggestionSelection(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from firing before click
            >
              {typeof suggestion === 'string' ? 
                suggestion : 
                suggestion['Station Name'] || suggestion.name || JSON.stringify(suggestion)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 