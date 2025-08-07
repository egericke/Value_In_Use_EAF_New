export function Table({ className = "", ...props }) {
  return <table className={`w-full text-sm ${className}`} {...props} />;
}

export function TableHeader(props) {
  return <thead {...props} />;
}

export function TableBody(props) {
  return <tbody {...props} />;
}

export function TableRow({ className = "", ...props }) {
  return <tr className={`border-b last:border-b-0 ${className}`} {...props} />;
}

export function TableHead({ className = "", ...props }) {
  return <th className={`text-left font-medium p-2 ${className}`} {...props} />;
}

export function TableCell({ className = "", ...props }) {
  return <td className={`p-2 ${className}`} {...props} />;
}
