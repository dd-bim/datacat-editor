import FormSet, {FormSetDescription, FormSetTitle} from "./FormSet";
import React, {FC} from "react";
import {
    Maybe,
    ToleranceInput,
    ToleranceType,
    useSetToleranceMutation,
    useUnsetToleranceMutation
} from "../../generated/types";
import {useSnackbar} from "notistack";
import ToleranceForm, {ToleranceDefaultFormValues} from "./ToleranceForm";

type ToleranceFormSetProps = {
    id: string
    toleranceType?: Maybe<ToleranceType>
    lowerTolerance?: Maybe<string>
    upperTolerance?: Maybe<string>
}

const ToleranceFormSet: FC<ToleranceFormSetProps> = (props) => {
    const {
        id,
        toleranceType,
        lowerTolerance,
        upperTolerance
    } = props;
    const defaultValues: ToleranceDefaultFormValues = {
        toleranceType: toleranceType ?? "",
        lowerTolerance: lowerTolerance ?? "",
        upperTolerance: upperTolerance ?? ""
    };

    const {enqueueSnackbar} = useSnackbar();
    const [setTolerance] = useSetToleranceMutation();
    const [unsetTolerance] = useUnsetToleranceMutation();

    const onSubmit = async (tolerance: ToleranceInput) => {
        await setTolerance({
            variables: {
                input: {valueId: id, tolerance}
            }
        });
        enqueueSnackbar("Toleranz aktualisiert.");
    };

    const onDelete = async () => {
        await unsetTolerance({
            variables: {
                input: {valueId: id}
            }
        });
        enqueueSnackbar("Toleranz entfernt.");
    };

    return (
        <FormSet>
            <FormSetTitle>Toleranz</FormSetTitle>
            <FormSetDescription>Die Toleranz eines Wertes kann absolut und prozentual angegeben
                werden.</FormSetDescription>
            <ToleranceForm
                onSubmit={onSubmit}
                onDelete={onDelete}
                defaultValues={defaultValues}
            />
        </FormSet>
    );
};

export default ToleranceFormSet;
