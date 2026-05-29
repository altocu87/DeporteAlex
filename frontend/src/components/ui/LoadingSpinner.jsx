export default function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="animate-spin rounded-full border-2 border-border border-t-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
