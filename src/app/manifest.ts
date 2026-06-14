import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chiti Console",
    short_name: "Chiti",
    description: "Operations OS for your businesses",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f0f1a",
    theme_color: "#0f0f1a",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
