export default function HomeLoading() {
  return (
    <div className="space-y-4">
      <div className="glass-card h-36 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-card h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
