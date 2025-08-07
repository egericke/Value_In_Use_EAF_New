export function Input({ className = "", ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
