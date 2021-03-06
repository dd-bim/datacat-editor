import FormSet, {FormSetTitle} from "./FormSet";
import React, {FC} from "react";
import {
    Maybe,
    NominalValueInput,
    useSetNominalValueMutation,
    useUnsetNominalValueMutation,
    ValueRole,
    ValueType
} from "../../generated/types";
import {useSnackbar} from "notistack";
import NominalValueForm, {NominalValueDefaultFormValues} from "./NominalValueForm";

type NominalValueFormSetProps = {
    id: string
    valueType?: Maybe<ValueType>
    valueRole?: Maybe<ValueRole>
    nominalValue?: Maybe<string>
}

const NominalValueFormSet: FC<NominalValueFormSetProps> = (props) => {
    const {
        id,
        valueType,
        valueRole,
        nominalValue
    } = props;
    const defaultValues: NominalValueDefaultFormValues = {
        valueType: valueType ?? "",
        valueRole: valueRole ?? "",
        nominalValue: nominalValue ?? ""
    };

    const {enqueueSnackbar} = useSnackbar();
    const [setNominalValue] = useSetNominalValueMutation();
    const [unsetNominalValue] = useUnsetNominalValueMutation();

    const onSubmit = async (nominalValue: NominalValueInput) => {
        await setNominalValue({
            variables: {
                input: {valueId: id, nominalValue}
            }
        });
        enqueueSnackbar("Nennwert aktualisiert.");
    };

    const onDelete = async () => {
        await unsetNominalValue({
            variables: {
                input: {valueId: id}
            }
        });
        enqueueSnackbar("Nennwert entfernt.");
    };

    return (
        <FormSet>
            <FormSetTitle>Nennwert</FormSetTitle>
            <NominalValueForm
                onSubmit={onSubmit}
                onDelete={onDelete}
                defaultValues={defaultValues}
            />
        </FormSet>
    );
};

export default NominalValueFormSet;
