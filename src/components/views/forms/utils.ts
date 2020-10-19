import {SearchResultPropsFragment} from "../../../generated/types";

export const toConceptSelectOption = ({__typename: typeName, ...otherProps}: SearchResultPropsFragment) => ({
    typeName,
    ...otherProps
});
