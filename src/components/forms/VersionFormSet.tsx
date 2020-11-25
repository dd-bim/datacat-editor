import VersionForm from "./VersionForm";
import {FormSet} from "./FormSet";
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
    const defaultValues = {versionId: versionId ?? "", versionDate: versionDate ?? ""};
    const {enqueueSnackbar} = useSnackbar();
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
        <FormSet
            title="Version"
            description="Die Version kann für die Anwendungsdomäne frei bestimmt und formatiert werden."
        >
            <VersionForm
                onSubmit={onSubmit}
                defaultValues={defaultValues}
            />
        </FormSet>
    );
};

export default VersionFormSet;
