// Enhanced Well Number Input Component
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';

const WellNumberInput = ({ 
  value, 
  onWellNumberSelect, 
  placeholder = "Enter well number (e.g., KGC-001)",
  suggestionSources = [],
  showSuggestions = true,
  debounceDelay = 500
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Debounced search for suggestions
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (inputValue.length >= 2 && showSuggestions) {
        generateSuggestions(inputValue);
      } else {
        setSuggestions([]);
      }
    }, debounceDelay);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, suggestionSources, showSuggestions]);

  const generateSuggestions = async (searchText) => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const uniqueWellNumbers = new Set();
      
      // Extract well numbers from suggestion sources
      suggestionSources.forEach(source => {
        if (Array.isArray(source)) {
          source.forEach(item => {
            if (item.wellNumber && 
                item.wellNumber.toLowerCase().includes(searchText.toLowerCase())) {
              uniqueWellNumbers.add(item.wellNumber);
            }
          });
        }
      });

      // Generate common well number patterns if no existing data
      if (uniqueWellNumbers.size === 0) {
        const patterns = generateWellNumberPatterns(searchText);
        patterns.forEach(pattern => uniqueWellNumbers.add(pattern));
      }

      const suggestionList = Array.from(uniqueWellNumbers)
        .slice(0, 10) // Limit to 10 suggestions
        .map(wellNumber => ({
          wellNumber,
          isExisting: suggestionSources.some(source => 
            Array.isArray(source) && source.some(item => item.wellNumber === wellNumber)
          )
        }));

      setSuggestions(suggestionList);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWellNumberPatterns = (searchText) => {
    const patterns = [];
    const upperSearch = searchText.toUpperCase();
    
    // Common oil & gas well number patterns
    const prefixes = ['KGC', 'KGOC', 'KG', 'OIL', 'GAS', 'WTR'];
    const currentYear = new Date().getFullYear().toString().slice(-2);
    
    prefixes.forEach(prefix => {
      // If searching starts with letters, suggest with numbers
      if (upperSearch.match(/^[A-Z]+/)) {
        for (let i = 1; i <= 9; i++) {
          patterns.push(`${prefix}-${String(i).padStart(3, '0')}`);
          patterns.push(`${prefix}-${currentYear}${String(i).padStart(2, '0')}`);
        }
      }
      
      // If input matches prefix pattern
      if (prefix.startsWith(upperSearch) || upperSearch.startsWith(prefix)) {
        patterns.push(`${prefix}-001`);
        patterns.push(`${prefix}-${currentYear}01`);
      }
    });

    // If input is numeric, suggest with common prefixes
    if (upperSearch.match(/^\d+/)) {
      const num = upperSearch.padStart(3, '0');
      prefixes.forEach(prefix => {
        patterns.push(`${prefix}-${num}`);
      });
    }

    return [...new Set(patterns)].slice(0, 5);
  };

  const handleInputChange = (text) => {
    // Allow uninterrupted typing - only update local state
    setInputValue(text);
  };

  const handleInputSubmit = () => {
    // Only trigger selection when user explicitly submits
    if (inputValue.trim()) {
      handleWellNumberSelect(inputValue.trim());
    }
  };

  const handleWellNumberSelect = (wellNumber) => {
    setInputValue(wellNumber);
    setSuggestions([]);
    setShowSuggestionModal(false);
    onWellNumberSelect(wellNumber);
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    onWellNumberSelect('');
    inputRef.current?.focus();
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        item.isExisting && styles.existingSuggestionItem
      ]}
      onPress={() => handleWellNumberSelect(item.wellNumber)}
    >
      <View style={styles.suggestionContent}>
        <Text style={[
          styles.suggestionText,
          item.isExisting && styles.existingSuggestionText
        ]}>
          {item.wellNumber}
        </Text>
        {item.isExisting && (
          <View style={styles.existingBadge}>
            <Text style={styles.existingBadgeText}>Has Data</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            inputValue && styles.inputWithValue
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          onSubmitEditing={handleInputSubmit}
          onEndEditing={handleInputSubmit}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          blurOnSubmit={false}
        />
        
        {inputValue && (
          <TouchableOpacity style={styles.clearButton} onPress={clearInput}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        
        {suggestions.length > 0 && (
          <TouchableOpacity
            style={styles.suggestionsButton}
            onPress={() => setShowSuggestionModal(true)}
          >
            <Text style={styles.suggestionsButtonText}>
              {suggestions.length} suggestions
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Quick suggestions (first 3) */}
      {suggestions.length > 0 && !showSuggestionModal && (
        <View style={styles.quickSuggestions}>
          {suggestions.slice(0, 3).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickSuggestionItem,
                item.isExisting && styles.quickSuggestionItemExisting
              ]}
              onPress={() => handleWellNumberSelect(item.wellNumber)}
            >
              <Text style={[
                styles.quickSuggestionText,
                item.isExisting && styles.quickSuggestionTextExisting
              ]}>
                {item.wellNumber}
              </Text>
              {item.isExisting && <Text style={styles.quickSuggestionBadge}>●</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestionModal(false)}
        >
          <View style={styles.suggestionsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Well Number Suggestions</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSuggestionModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item, index) => `${item.wellNumber}-${index}`}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputWithValue: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
  },
  suggestionsButton: {
    position: 'absolute',
    right: 40,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  suggestionsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  quickSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  quickSuggestionItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickSuggestionItemExisting: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  quickSuggestionText: {
    fontSize: 14,
    color: '#333',
  },
  quickSuggestionTextExisting: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  quickSuggestionBadge: {
    marginLeft: 4,
    color: '#4CAF50',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '60%',
    width: '80%',
    maxWidth: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  existingSuggestionItem: {
    backgroundColor: '#f8fff8',
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  existingSuggestionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  existingBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  existingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WellNumberInput;