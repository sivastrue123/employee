declare module "*.css";
declare module "*.scss";
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_FORCE_DESKTOP: string;
  // add more custom env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}
