import { useEffect, useState } from "react";

export default function ExampleComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevent rendering on the server
  }

  return <div>{/* ...existing code... */}</div>;
}
