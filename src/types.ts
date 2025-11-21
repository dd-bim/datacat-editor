import {SearchResultPropsFragment, ValueListDetailPropsFragment} from "./generated/types";

export type CatalogRecord = Pick<SearchResultPropsFragment,
    "id" | "recordType" | "name" |  "comment" | "tags">; // "description" |

// Runtime Environment Configuration Types
export interface RuntimeEnvironmentConfig {
  MINIO_ENDPOINT: string;
  MINIO_PORT: string;
  MINIO_USE_SSL: string;
  MINIO_BUCKET_NAME: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
}

// Erweitere das Window Interface
declare global {
  interface Window {
    ENV_CONFIG: RuntimeEnvironmentConfig;
  }
}
