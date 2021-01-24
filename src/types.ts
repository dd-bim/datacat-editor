import {SearchResultPropsFragment} from "./generated/types";

export type CatalogRecord = Pick<SearchResultPropsFragment,
    "id" | "recordType" | "name" | "description" | "tags">;
