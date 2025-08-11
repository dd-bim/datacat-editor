import VersionForm from "./VersionForm";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import React, { FC } from "react";
import {
  Maybe,
  useUpdateMajorVersionMutation,
  useUpdateMinorVersionMutation,
  UpdateMajorVersionInput,
  UpdateMinorVersionInput
} from "../../generated/types";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

type VersionFormSetProps = {
  id: string;
  majorVersion?: Maybe<number>;
  minorVersion?: Maybe<number>;
};

// Replace makeStyles with styled component
const StyledFormSetDescription = styled(FormSetDescription)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const VersionFormSet: FC<VersionFormSetProps> = (props) => {
  const { id, majorVersion, minorVersion } = props;
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = {
    majorVersion: majorVersion ?? 1,
    minorVersion: minorVersion ?? 0,
  };

  const [setMajorVersion] = useUpdateMajorVersionMutation();
  const [setMinorVersion] = useUpdateMinorVersionMutation();

  const onSubmit = async (values: UpdateMajorVersionInput & UpdateMinorVersionInput) => {
    await setMajorVersion({
      variables: {
        input: { catalogEntryId: id, majorVersion: values.majorVersion },
      },
    });
        await setMinorVersion({
      variables: {
        input: { catalogEntryId: id, minorVersion: values.minorVersion },
      },
    });
    enqueueSnackbar("Version aktualisiert.");
  };

  return (
    <FormSet>
      <FormSetTitle>
        <b>
          <T keyName="version.title" />
        </b>
      </FormSetTitle>
      <StyledFormSetDescription>
        <T keyName="version.description" />
      </StyledFormSetDescription>
      <div style={{ marginBottom: "12px" }}></div>
      <VersionForm onSubmit={onSubmit} defaultValues={defaultValues} />
    </FormSet>
  );
};

export default VersionFormSet;
