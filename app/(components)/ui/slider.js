export function Slider({ value, onValueChange, max = 100, step = 1, className = "" }) {
  const handleChange = (e) => {
    const val = Number(e.target.value);
    onValueChange([val]);
  };
  return (
    <input
      type="range"
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={`w-full ${className}`}
    />
  );
}
