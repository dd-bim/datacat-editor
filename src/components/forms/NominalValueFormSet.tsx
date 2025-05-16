// import FormSet, {FormSetTitle} from "./FormSet";
// import React from "react";
// import {
//     Maybe,
//     NominalValueInput,
//     useSetNominalValueMutation,
//     useUnsetNominalValueMutation,
//     ValueRole,
//     ValueType
// } from "../../generated/types";
// import {useSnackbar} from "notistack";
// import NominalValueForm, {NominalValueDefaultFormValues} from "./NominalValueForm";
// import { T } from '@tolgee/react';

// type NominalValueFormSetProps = {
//     id: string
//     valueType?: Maybe<ValueType>
//     valueRole?: Maybe<ValueRole>
//     nominalValue?: Maybe<string>
// }

// const NominalValueFormSet = (props: NominalValueFormSetProps) => {
//     const {
//         id,
//         valueType,
//         valueRole,
//         nominalValue
//     } = props;
//     const defaultValues: NominalValueDefaultFormValues = {
//         valueType: valueType ?? "",
//         valueRole: valueRole ?? "",
//         nominalValue: nominalValue ?? ""
//     };

//     const {enqueueSnackbar} = useSnackbar();
//     const [setNominalValue] = useSetNominalValueMutation();
//     const [unsetNominalValue] = useUnsetNominalValueMutation();

//     const onSubmit = async (nominalValue: NominalValueInput) => {
//         await setNominalValue({
//             variables: {
//                 input: {valueId: id, nominalValue}
//             }
//         });
//         enqueueSnackbar(<T keyName="nominal_value_form.updated">Nennwert aktualisiert.</T>);
//     };

//     const onDelete = async () => {
//         await unsetNominalValue({
//             variables: {
//                 input: {valueId: id}
//             }
//         });
//         enqueueSnackbar(<T keyName="nominal_value_form.removed">Nennwert entfernt.</T>);
//     };

//     return (
//         <FormSet>
//             <FormSetTitle><T keyName="nominal_value_form.title">Nennwert</T></FormSetTitle>
//             <NominalValueForm
//                 onSubmit={onSubmit}
//                 onDelete={onDelete}
//                 defaultValues={defaultValues}
//             />
//         </FormSet>
//     );
// };

// export default NominalValueFormSet;
