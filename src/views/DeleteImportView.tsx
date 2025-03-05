import Button from "@mui/material/Button";
import View from "./View";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { SearchResultPropsFragment, useDeleteEntryMutation, useFindItemQuery, useFindTagsQuery } from "../generated/types";
import { Grid, TextField } from "@mui/material";
import { Domain } from "../domain";
import { useSnackbar } from "notistack";
import { T } from "@tolgee/react";

export function DeleteImportView() {
  const [tag, setTag] = useState<string | null>(null);
  const [tagId, setTagId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [output, setOutput] = useState<React.ReactNode>("");
  const [deleteEntry] = useDeleteEntryMutation();
  const [records, setRecords] = useState<SearchResultPropsFragment[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  // get tag text input
  const handleTagChange = (event: any) => {
    setTag(event.target.value);
    if (event.target.value !== "") {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  };

  // get all tags in database
  const result = useFindTagsQuery({
    variables: {
      pageSize: 100,
    },
  });

  // search entries with properties
  const { refetch } = useFindItemQuery({
    variables: {
      input: {
        tagged: [tagId],
        entityTypeIn: Domain.map((x) => x.recordType),
      },
      pageSize: 10000,
    },
    fetchPolicy: "no-cache",
  });

  // search if tag exists, if yes, find all entries tagged with a tag
  useEffect(() => {
    const tagList = result.data?.findTags.nodes ?? [];
    let tagObj = tagList.find((obj) => obj.name === tag);
    if (tagObj !== undefined) {
      setTagId(tagObj.id);
      refetch({
        input: {
          tagged: [tagObj.id],
          entityTypeIn: Domain.map((x) => x.recordType),
        },
        pageSize: 10000,
      }).then((result) => {
        setRecords(result.data!.search.nodes);
      });
    } else {
      setRecords([]);
    }
  }, [tag, result, refetch]);

  // delete all entries with the given tag
  const handleDeleteEntries = async () => {
    if (records === undefined || records.length === 0) {
      setOutput(<T keyName="delete_import_view.tag_not_exist" params={{ tag }} />);
      return;
    }

    // try to delete entries
    try {
      for (const { id, name } of records) {
        await deleteEntry({
          variables: {
            id: id,
          },
        });
        enqueueSnackbar(<T keyName="delete_import_view.delete_success" params={{ name }} />);
      }
    } catch (e) {
      if (e instanceof Error) {
        setOutput(
          <>
            <T keyName="delete_import_view.error_occurred" />
            {e.message}
          </>
        );
      }
    }
  };

  return (
    <View heading={<T keyName="delete_import_view.heading" />}>
      <Typography variant={"body1"}>
        <T keyName="delete_import_view.description" />
        <br />
        <br />
      </Typography>
      <div>
        <Grid container justifyContent="flex-start">
          <Grid item>
            <TextField id="importTag" label={<T keyName="delete_import_view.tag_label" />} name="importTag" variant="outlined" size="small" onChange={handleTagChange} />
          </Grid>
        </Grid>
      </div>
      <Button onClick={handleDeleteEntries} disabled={!loaded}>
        <T keyName="delete_import_view.delete_button" />
      </Button>
      <Typography color="secondary">{output}</Typography>
    </View>
  );
}