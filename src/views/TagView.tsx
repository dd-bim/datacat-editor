import React, { useState, useEffect } from "react";
import { useFindTagsQuery, useCreateTagMutation } from "../generated/types";
import {
  Chip,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSnackbar } from "notistack";
import { Theme } from "@mui/material/styles";
import { T } from "@tolgee/react";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(2),
    border: "2px solid #ccc",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: theme.spacing(2),
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  form: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4), // Add marginTop to increase the spacing
  },
  explanation: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    minWidth: 200,
    marginRight: theme.spacing(2),
  },
  button: {
    minWidth: 120,
  },
  tagChip: {
    margin: theme.spacing(0.5),
    fontSize: theme.typography.fontSize,
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: theme.spacing(4),
  },
}));

const TagView: React.FC = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading, error, refetch } = useFindTagsQuery({
    variables: { pageSize: 100 },
  });
  const [createTag] = useCreateTagMutation();
  const [newTagName, setNewTagName] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setTags(data.findTags.nodes.map((tag) => tag.name));
    }
  }, [data]);

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      enqueueSnackbar(<T keyName="tag_view.enter_tag_name" />, {
        variant: "error",
      });
      return;
    }

    if (tags.includes(newTagName)) {
      enqueueSnackbar(<T keyName="tag_view.tag_exists" params={{ tag: newTagName }} />, {
        variant: "warning",
      });
      return;
    }

    try {
      await createTag({
        variables: {
          input: {
            name: newTagName,
          },
        },
      });
      enqueueSnackbar(<T keyName="tag_view.tag_added_success" params={{ tag: newTagName }} />, {
        variant: "success",
      });
      setNewTagName("");
      refetch();
    } catch (error) {
      enqueueSnackbar(<T keyName="tag_view.tag_added_error" params={{ tag: newTagName }} />, {
        variant: "error",
      });
      console.error("Fehler beim Hinzufügen des Tags:", error);
    }
  };

  if (loading) {
    return <Typography variant="h6"><T keyName="tag_view.loading" /></Typography>;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        <T keyName="tag_view.error_loading" params={{ error: error.message }} />
      </Typography>
    );
  }

  // Sortiere die Tags alphabetisch nach Name
  const sortedTags = data?.findTags.nodes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Paper className={classes.container}>
      <Typography variant="h4" gutterBottom>
        <T keyName="tag_view.heading" />
      </Typography>
      <Typography variant="body1" className={classes.explanation}>
        <T keyName="tag_view.explanation" />
      </Typography>
      <form className={classes.form} onSubmit={(e) => e.preventDefault()}>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel htmlFor="new-tag" shrink={newTagName !== ""}>
            <T keyName="tag_view.new_tag_label" />
          </InputLabel>
          <TextField
            id="new-tag"
            variant="outlined"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTag}
          className={classes.button}
        >
          <T keyName="tag_view.add_tag_button" />
        </Button>
      </form>
      <div className={classes.buttonContainer} />
      <div className={classes.chipContainer}>
        {sortedTags?.map((tag) => (
          <Chip key={tag.id} label={tag.name} className={classes.tagChip} />
        ))}
      </div>
    </Paper>
  );
};

export default TagView;
