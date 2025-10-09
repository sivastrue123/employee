// src/components/ui/input-with-suggestions.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { EntityOption } from '@/types/amc';
import { Check, PlusCircle } from 'lucide-react';

interface InputWithSuggestionsProps {
    options: EntityOption[];
    placeholder: string;
    fieldValue: string; // The selected ID or 'new'
    fieldOnChange: (value: string) => void; // Update the form ID
    newEntryValue: string; // The text typed for a new entry
    newEntryOnChange: (value: string) => void; // Update the form's newEntryName field
}

export const InputWithSuggestions = React.forwardRef<
    HTMLInputElement,
    InputWithSuggestionsProps
>(({ options, placeholder, fieldValue, fieldOnChange, newEntryValue, newEntryOnChange, ...props }, ref) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    // Filter options based on the user's input
    const filteredOptions = options.filter(
        (option) =>
            option.id !== 'new' && // Exclude 'new' entry from standard filtering
            option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isNewEntrySelected = fieldValue === 'new';

    // Determine the display value for the input field
    let displayValue = isNewEntrySelected ? newEntryValue : options.find(o => o.id === fieldValue)?.name || '';

    // HANDLERS
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Always open suggestions when typing
        if (value.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }

        // If the user starts typing, we assume it might be a new entry until an existing one is selected
        if (isNewEntrySelected) {
            newEntryOnChange(value);
        } else {
            // Clear the ID if the user starts typing over an existing selection
            fieldOnChange('');
            newEntryOnChange(value);
        }
    };

    const handleFocus = () => {
        setShowSuggestions(true);
    };

    const handleBlur = () => {
        // A small delay allows the click event on a suggestion to register before the popover closes
        setTimeout(() => {
            setShowSuggestions(false);
            // If the user typed something and then blurred without selecting, assume they want a new entry
            if (!fieldValue && searchTerm.trim() !== '') {
                fieldOnChange('new');
            }
        }, 150);
    };

    const handleSelect = (id: string, name: string) => {
        fieldOnChange(id); // Set the selected ID
        newEntryOnChange(name); // Set the text value for display/reset
        setSearchTerm(''); // Clear internal search state
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <input
                ref={ref}
                type="text"
                placeholder={placeholder}
                // Use either the selected name or the currently typed search term
                value={isNewEntrySelected ? newEntryValue : searchTerm || displayValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',

                )}
                {...props}
            />

            {showSuggestions && (
                <div className="absolute z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {/* List all filtered options */}
                    {filteredOptions.map((option) => (
                        <div
                            key={option.id}
                            className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground flex justify-between items-center"
                            onMouseDown={() => handleSelect(option.id, option.name)} // Use onMouseDown to prevent blur event from firing first
                        >
                            {option.name}
                            {fieldValue === option.id && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                    ))}

                    {/* Show "New Entry" option if something is typed AND it doesn't match an existing entry */}
                    {searchTerm.trim() !== '' && filteredOptions.length === 0 && (
                        <div
                            className="px-3 py-2 cursor-pointer bg-sky-50 text-sky-600 font-semibold hover:bg-sky-100 flex items-center"
                            onMouseDown={() => handleSelect('new', searchTerm.trim())}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New: "{searchTerm.trim()}"
                        </div>
                    )}

                    {/* Show empty message if nothing is found and nothing is typed */}
                    {searchTerm.trim() === '' && filteredOptions.length === 0 && (
                        <div className="p-3 text-center text-muted-foreground">
                            Start typing to search or create a new entry.
                        </div>
                    )}

                </div>
            )}
        </div>
    );
});

InputWithSuggestions.displayName = 'InputWithSuggestions';