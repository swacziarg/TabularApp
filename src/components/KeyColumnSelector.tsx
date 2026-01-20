type KeyColumnSelectorProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
    disabled?: boolean;
  };
  
  export function KeyColumnSelector({
    label,
    value,
    onChange,
    options,
    disabled,
  }: KeyColumnSelectorProps) {
    return (
      <label className="selectRow">
        <span className="selectLabel">{label}</span>
        <select
          className="selectInput"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.length === 0 ? <option value="">—</option> : null}
  
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }
  