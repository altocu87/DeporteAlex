export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
