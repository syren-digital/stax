"use client";

import { useEffect, useState } from "react";

interface PreviewFrameProps {
  src: string;
  widgetType: string;
}

export function PreviewFrame({ src, widgetType }: PreviewFrameProps) {
  const height = widgetType === "share_price_number" ? 200 : 600;
  const [key, setKey] = useState(0);

  useEffect(() => {
    function handleSaved() {
      setKey((k) => k + 1);
    }
    window.addEventListener("widget-saved", handleSaved);
    return () => window.removeEventListener("widget-saved", handleSaved);
  }, []);

  return (
    <iframe
      key={key}
      src={src}
      className="w-full"
      style={{ height, border: "none" }}
      title="Widget preview"
    />
  );
}
