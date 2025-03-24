import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "wouter";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={Index} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/404" component={NotFound} />
        <Route path="/*" component={NotFound} />
      </Router>
    </QueryClientProvider>
  );
}

export default App;