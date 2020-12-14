import VersionForm from "./VersionForm";
import FormSet, {FormSetDescription, FormSetTitle, useFieldSetStyles} from "./FormSet";
import React, {FC} from "react";
import {Maybe, useSetVersionMutation, VersionInput} from "../../generated/types";
import {useSnackbar} from "notistack";

type VersionFormSetProps = {
    id: string
    versionId?: Maybe<string>
    versionDate?: Maybe<string>
}

const VersionFormSet: FC<VersionFormSetProps> = (props) => {
    const {
        id,
        versionId,
        versionDate
    } = props;

    const classes = useFieldSetStyles();
    const {enqueueSnackbar} = useSnackbar();

    const defaultValues = {versionId: versionId ?? "", versionDate: versionDate ?? ""};

    const [setVersion] = useSetVersionMutation();

    const onSubmit = async (values: VersionInput) => {
        await setVersion({
            variables: {
                input: {catalogEntryId: id, version: values}
            }
        });
        enqueueSnackbar("Version aktualisiert.");
    }

    return (
        <FormSet>
            <FormSetTitle>Version</FormSetTitle>
            <FormSetDescription className={classes.gutterBottom}>
                Die Version kann für die Anwendungsdomäne frei bestimmt und formatiert werden.
            </FormSetDescription>
            <VersionForm
                onSubmit={onSubmit}
                defaultValues={defaultValues}
            />
        </FormSet>
    );
};

export default VersionFormSet;
