import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function TestButton() {
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState("");

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    setMessage(`Button clicked ${clickCount + 1} times!`);
    console.log("Button clicked successfully!");
    // toast.success("Button clicked!", {
    //   description: `Click count: ${clickCount + 1}`
    // });
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Button Component</h1>
        <p className="text-muted-foreground mb-6">
          Testing basic onClick functionality
        </p>
        
        <div className="space-y-4">
          <Button onClick={handleClick} size="lg" className="w-full">
            Click Me
          </Button>
          
          <div className="text-center">
            <p className="text-lg font-semibold">Click Count: {clickCount}</p>
            {message && (
              <p className="text-sm text-muted-foreground mt-2">{message}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
