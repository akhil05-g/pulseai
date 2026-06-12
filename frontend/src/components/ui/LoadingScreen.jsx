export default function LoadingScreen({ text = 'Loading...', subtext = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      {/* Animated rings */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" style={{ animationDuration: '0.8s' }} />
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-accent-400 animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-600">{text}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
}
