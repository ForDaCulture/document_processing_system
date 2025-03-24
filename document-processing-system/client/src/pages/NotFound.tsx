export default function NotFound() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/" className="text-blue-500 underline">Go Home</a>
    </div>
  );
}