declare module "*.css";
declare module "*.scss";
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  // add more custom env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}