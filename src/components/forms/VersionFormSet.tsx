import VersionForm from "./VersionForm";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import React, { FC } from "react";
import {
  Maybe,
  useSetVersionMutation,
  VersionInput,
} from "../../generated/types";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

type VersionFormSetProps = {
  id: string;
  versionId?: Maybe<string>;
  versionDate?: Maybe<string>;
};

// Replace makeStyles with styled component
const StyledFormSetDescription = styled(FormSetDescription)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const VersionFormSet: FC<VersionFormSetProps> = (props) => {
  const { id, versionId, versionDate } = props;
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = {
    versionId: versionId ?? "",
    versionDate: versionDate ?? "",
  };

  const [setVersion] = useSetVersionMutation();

  const onSubmit = async (values: VersionInput) => {
    await setVersion({
      variables: {
        input: { catalogEntryId: id, version: values },
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
