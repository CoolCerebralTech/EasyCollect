// =====================================================
// components/ui/Divider.tsx
// Visual divider component
// =====================================================

export interface DividerProps {
  text?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ text, className = '' }) => {
  if (text) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">{text}</span>
        </div>
      </div>
    );
  }

  return <div className={`border-t border-gray-300 ${className}`} />;
};