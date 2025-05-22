import {SearchResultPropsFragment, ValueListDetailPropsFragment} from "./generated/types";

export type CatalogRecord = Pick<SearchResultPropsFragment,
    "id" | "recordType" | "name" |  "comment" | "tags">; // "description" |
