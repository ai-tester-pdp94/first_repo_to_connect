import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Integration Error Book",
    short_name: "Error Book",
    description:
      "Look up IDoc and SAP Integration Suite errors, the SAP Community fix, and what worked in your landscape.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#09090b",
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
