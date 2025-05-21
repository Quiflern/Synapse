import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

/**
 * NotFound - 404 page component
 *
 * Displayed when a user navigates to a non-existent route.
 */
const NotFound: React.FC = () => {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
      <div className="text-8xl font-bold mb-4 text-electric">404</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-6 max-w-md">
        The page you're looking for doesn't exist or has been moved to another
        URL.
      </p>
      <Link to="/">
        <Button className="bg-electric hover:bg-electric/90 text-white">
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
