export default function Container({ className = '', children }) {
  return <div className="max-w-6xl container mx-auto px-4 md:px-8 lg:px-12">{children}</div>;
}
