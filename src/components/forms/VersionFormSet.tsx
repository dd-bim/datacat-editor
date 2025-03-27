import VersionForm from "./VersionForm";
import FormSet, { FormSetDescription, FormSetTitle } from "./FormSet";
import React, { FC } from "react";
import {
  Maybe,
  useSetVersionMutation,
  VersionInput,
} from "../../generated/types";
import { useSnackbar } from "notistack";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import { T } from "@tolgee/react";

type VersionFormSetProps = {
  id: string;
  versionId?: Maybe<string>;
  versionDate?: Maybe<string>;
};

const useStyles = makeStyles((theme: Theme) => ({
  description: {
    marginBottom: theme.spacing(1),
  },
}));

const VersionFormSet: FC<VersionFormSetProps> = (props) => {
  const { id, versionId, versionDate } = props;

  const classes = useStyles();
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
      <FormSetDescription className={classes.description}>
        <T keyName="version.description" />
      </FormSetDescription>
      <div style={{ marginBottom: "12px" }}></div>
      <VersionForm onSubmit={onSubmit} defaultValues={defaultValues} />
    </FormSet>
  );
};

export default VersionFormSet;
