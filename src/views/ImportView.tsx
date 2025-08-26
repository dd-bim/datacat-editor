import View from "./View";
import { Box, Button, TextField, Typography, ButtonProps } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  FindTagsResultFragment,
  RelationshipRecordType,
  CatalogRecordType,
  useCreateEntryMutation,
  useCreateRelationshipMutation,
  useCreateTagMutation,
  useFindTagsQuery,
} from "../generated/types";
import { v4 as uuidv4 } from "uuid";
import { ApolloCache } from "@apollo/client";
import { useSnackbar } from "notistack";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { T } from "@tolgee/react";
import { styled } from "@mui/material/styles";

export const IMPORT_TAG_ID = "KATALOG-IMPORT";
type entity = {
  id: string;
  typ: string;
  tags: string;
  name: string;
  name_en?: string;
  description?: string;
  majorVersion?: number;
  minorVersion?: number;
  status?: string;
};
type relation = {
  entity1: string;
  relationship: string;
  entity2: string;
};

// Add styled components for better organization and consistency
const StyledTable = styled('table')(({ theme }) => ({
  borderCollapse: 'collapse',
  width: '100%',
  marginTop: theme.spacing(2), // Reduced from 4 to 2
  marginBottom: theme.spacing(2), // Reduced from 4 to 2
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.75, 1),
  },
  '& th': {
    backgroundColor: theme.palette.mode === 'dark'
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
    fontWeight: 'bold',
  }
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  marginBottom: theme.spacing(2),
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

const ButtonWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
}));

const ActionButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export function ImportView() {
  const [entitiesFile, setEntitiesFile] = useState(null);
  const [relationsFile, setRelationsFile] = useState(null);
  const [createTag] = useCreateTagMutation();
  const [tags, setTags] = useState<FindTagsResultFragment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [output, setOutput] = useState<string | React.ReactNode>("");
  const [init, setInit] = useState(false);
  const [importTag, setImportTag] = useState(""); // Empty string as default
  const fileRef = useRef<HTMLInputElement>(null);
  const [control, setControl] = useState(1);

  // get list o tags
  const { refetch } = useFindTagsQuery({
    variables: {
      pageSize: 100,
    },
  });

  const { enqueueSnackbar } = useSnackbar();

  const reload = () => {
    setControl(Math.random());
  };

  // create new entity records by query
  const [create] = useCreateEntryMutation({
    update: (cache: ApolloCache) => {
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          hierarchy: (value: any, { DELETE }: any) => DELETE,
          search: (value: any, { DELETE }: any) => DELETE,
          findDictionaries: (value: any, { DELETE }: any) => DELETE,
        },
      });
    },
  });

  // create new relationship records by query
  const update = (cache: ApolloCache) =>
    cache.modify({
      id: "ROOT_QUERY",
      fields: {
        hierarchy: (value: any, { DELETE }: any) => DELETE,
      },
    });
  const [createRelationship, error] = useCreateRelationshipMutation({ update });

  // handle file selection and update tag list
  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      if (event.target.name === "entitiesFile") setEntitiesFile(selectedFile);
      if (event.target.name === "relationsFile") setRelationsFile(selectedFile);
      refetch({ pageSize: 100 }).then((response) => {
        setTags(response.data?.findTags.nodes ?? []);
      });
    }
    setInit(false);
  };

  const handleImportTagChange = (event: any) => {
    setImportTag(event.target.value);
  };

  // enable import button, if all files are selected
  useEffect(() => {
    if (entitiesFile && !relationsFile) {
      setLoaded(true);
      setOutput(<T keyName="import.note_entities_only" />);
    } else if (!entitiesFile && relationsFile) {
      setLoaded(true);
      setOutput(<T keyName="import.note_relations_only" />);
    } else if (entitiesFile && relationsFile) {
      setLoaded(true);
      setOutput("");
    } else {
      setLoaded(false);
      setOutput("");
    }
  }, [entitiesFile, relationsFile]);

  // handle upload and file reading on import button click
  const parseEntitiesFile = (text: string): entity[] | null => {
    const lines = text.split("\n");
    const header = [
      "id",
      "typ",
      "tags",
      "name",
      "name_en",
      "description",
      "majorVersion",
      "minorVersion",
      "status"
    ];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (index === 0) {
        const content = line.replaceAll('"', "").replace(/\s/g, "").split(";");
        if (
          content.length !== header.length ||
          !content.every((val, i) => val === header[i])
        ) {
          setOutput(<T keyName="import.error_columns_mismatch" />);
          return null;
        }
      }
    }

    return lines
      .slice(1)
      .filter((line) => line && line.trim() !== "")
      .map((line) => {
        const content = line.replaceAll('"', "").replace(/\s/g, "").split(";");
        return {
          id: content[0] || uuidv4(),
          typ: content[1],
          tags: content[2],
          name: content[3],
          name_en: content[4] || "",
          description: content[5] || "",
          majorVersion: parseInt(content[6]) || 1,
          minorVersion: parseInt(content[7]) || 0,
          status: content[8] || "XTD_ACTIVE"
        };
      });
  };

  const handleUpload = async () => {
    if (entitiesFile) {
      const entitiesReader = new FileReader();
      entitiesReader.readAsText(entitiesFile, "UTF-8");

      entitiesReader.onload = async () => {
        const text = entitiesReader.result as string;
        const parsedEntities = parseEntitiesFile(text);
        if (!parsedEntities) return;

        const tagToUse =
          importTag === "" || importTag === undefined || importTag === null
            ? IMPORT_TAG_ID
            : importTag;

        await handleOnCreateTag(tagToUse, tagToUse);
        await importEntities(parsedEntities, tags);
        setInit(true);
      };
    } else {
      setInit(true);
    }
  };

  // read relations if file exists and entities are imported completely, if file is existing on upload
  useEffect(() => {
    const importRelationsFile = async () => {
      if (!relationsFile || !init) return;

      const relationsReader = new FileReader();
      relationsReader.readAsText(relationsFile, "UTF-8");

      relationsReader.onload = async () => {
        const text = relationsReader.result as string;
        const lines = text.split("\n");
        const parsedRelations: relation[] = [];

        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          if (!line) break;
          const content = line.replaceAll('"', "").replace(/\s/g, "").split(";");

          if (index === 0) {
            const header = [
              "entity1",
              "relationship",
              "entity2"
            ];
            const isHeaderValid = content.length === header.length && content.every((val, i) => val === header[i]);
            if (!isHeaderValid) {
              setOutput(<T keyName="import.error_columns_mismatch" />);
              return;
            }
          } else {
            parsedRelations.push({
              entity1: content[0],
              relationship: content[1],
              entity2: content[2],
            });
          }
        }

        await importRelations(parsedRelations);

        // Nach dem Import zurücksetzen
        setLoaded(false);
        setEntitiesFile(null);
        setRelationsFile(null);
        reload();
      };
    };

    importRelationsFile();
  }, [init, relationsFile]);


  // creates new tag in database
  const handleOnCreateTag = async (tagId: string, name: string) => {
    await createTag({
      variables: {
        input: {
          tagId,
          name,
        },
      },
    });
    refetch({ pageSize: 100 });
  };

  const handleDownloadTemplate = () => {
    const zip = new JSZip();

    zip.file(
      "Entities.csv",
      "id;typ;tags;name;name_en;description;majorVersion;minorVersion;status"
    );
    zip.file(
      "Relationships.csv",
      "entity1;relationship;entity2"
    );

    zip.generateAsync({ type: "blob" }).then((content) => {
      FileSaver.saveAs(content, "datacat_import_templates.zip");
    });
  };

  // gives id of existing tag in tag list
  const idOfTag = (nodes: FindTagsResultFragment[], searchName: string) => {
    return nodes.find((obj) => obj.name === searchName)!.id;
  };

  // imports the entities into the database
  const importEntities = async (
    entities: entity[],
    tagArr: FindTagsResultFragment[]
  ) => {
    let tArr = [...tagArr];

    for (const { id, typ, tags, name, name_en, description, majorVersion, minorVersion, status } of entities) {
      // Import-Tag bestimmen
      const tagIds = [
        importTag === "" || importTag == null ? IMPORT_TAG_ID : importTag,
      ];

      // Zusätzliche Tags verarbeiten
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

      for (const tag of tagList) {
        let tagId = idOfTag(tArr, tag);
        if (!tagId) {
          tagId = uuidv4();
          try {
            await handleOnCreateTag(tagId, tag);
            tArr.push({ id: tagId, name: tag });
            enqueueSnackbar(<T keyName="import.new_tag_created" params={{ tag }} />);
          } catch (e) {
            setOutput(<T keyName="import.create_tag_failed" params={{ tag, error: e instanceof Error ? e.message : String(e) }} />);
            continue;
          }
        }
        tagIds.push(tagId);
      }

      try {
        let names = [{ languageTag: "de", value: name }];
        if (name_en) {
          names.push({ languageTag: "en", value: name_en });
        }
        await create({
          variables: {
            input: {
              catalogEntryType: typ.replace("Xtd", "") as CatalogRecordType,
              tags: tagIds,
              properties: {
                id: id,
                names: names,
                descriptions: description ? [{ languageTag: "de", value: description }] : [],
                majorVersion: majorVersion,
                minorVersion: minorVersion,
                status: status as any,
              },
            },
          },
        });
        enqueueSnackbar(<T keyName="import.created_record" params={{ name }} />);
      } catch (e) {
        setOutput(<T keyName="import.error_creating_record" params={{ typ, name, id, error: e instanceof Error ? e.message : String(e) }} />);
      }
    }
    setTags(tArr);
  };

  function toRelType(input: string): RelationshipRecordType {
    input = input
      .replace(/[_\- ]+/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

    if (input === "Groups") {
      input = "RelationshipToSubject";
    }
    return input as RelationshipRecordType;
  }

  // imports the relationships between the entities into database
  const importRelations = async (relations: relation[]) => {
    for (const rel of relations) {
      const relType = toRelType(rel.relationship);
      // Explicitly type properties as any to allow dynamic assignment
      const properties: any = {};
      if (relType === "RelationshipToSubject") {
        properties.relationshipToSubjectProperties = {
          relationshipType: "XTD_SCHEMA_LEVEL"
        };
      }
      console.log("Importing relationship", relType, rel.entity1, rel.entity2, properties);
      try {
        await createRelationship({
          variables: {
            input: {
              relationshipType: relType,
              properties: properties,
              fromId: rel.entity1,
              toIds: [rel.entity2],
            },
          },
        });
        enqueueSnackbar(
          <T
            keyName="import.created_relationship"
            params={{
              relationshipType: rel.relationship,
              entity1: rel.entity1,
              entity2: rel.entity2,
            }}
          />
        );
      } catch (e) {
        setOutput(
          <T
            keyName="import.error_creating_relationship"
            params={{
              relationshipType: rel.relationship,
              entity1: rel.entity1,
              entity2: rel.entity2,
              error: e instanceof Error ? e.message : String(e),
            }}
          />
        );
      }
    }
  };

  return (
    <View heading={<T keyName="import.heading" />}>
      <Typography variant={"body1"} component="div">
        <T keyName="import.description" />

        {/* Reduced spacing before first table */}
        <Box sx={{ my: 1.5 }}></Box>

        <Box component="div">
          <StyledTable>
            <thead>
              <tr>
                <th>id<sup>o</sup></th>
                <th>typ</th>
                <th>tags</th>
                <th>name</th>
                <th>name_en<sup>o</sup></th>
                <th>description<sup>o</sup></th>
                <th>majorVersion<sup>o</sup></th>
                <th>minorVersion<sup>o</sup></th>
                <th>status<sup>o</sup></th>
              </tr>
            </thead>
          </StyledTable>
        </Box>

        <Box sx={{ my: 1 }}></Box> {/* Consistent small spacing */}

        <T keyName="import.entity_columns_note" />
        <br />
        <T keyName="import.tags_note" />
        <br />
        <T keyName="import.relation_columns_note" />

        {/* Reduced spacing before second table */}
        <Box sx={{ my: 1.5 }}></Box>

        <Box component="div">
          <StyledTable>
            <thead>
              <tr>
                <th>entity1</th>
                <th>relationship</th>
                <th>entity2</th>
              </tr>
            </thead>
          </StyledTable>
        </Box>

        <Box sx={{ my: 1 }}></Box>

      </Typography>

      <Box sx={{ my: 2 }}></Box>

      <ButtonsContainer>
        <ButtonWrapper>
          <ActionButton
            variant="contained"
            component="label"
            color="primary"
          >
            <T keyName="import.entities_file_button" />
            <input
              type="file"
              name="entitiesFile"
              accept=".csv"
              hidden
              ref={fileRef}
              onChange={handleFileChange}
            />
          </ActionButton>
          <Typography color="textSecondary">
            {entitiesFile === null ? <T keyName="import.no_file_selected" /> : ""}
          </Typography>
        </ButtonWrapper>

        <ButtonWrapper>
          <ActionButton
            variant="contained"
            component="label"
            color="primary"
          >
            <T keyName="import.relations_file_button" />
            <input
              type="file"
              name="relationsFile"
              accept=".csv"
              hidden
              ref={fileRef}
              onChange={handleFileChange}
            />
          </ActionButton>
          <Typography color="textSecondary">
            {relationsFile === null ? <T keyName="import.no_file_selected" /> : ""}
          </Typography>
        </ButtonWrapper>

        <ButtonWrapper>
          <ActionButton
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!loaded}
          >
            <T keyName="import.import_button" />
          </ActionButton>
        </ButtonWrapper>

        <ButtonWrapper>
          <TextField
            id="importTag"
            label={<T keyName="import.import_tag_label" />}
            name="importTag"
            variant="outlined"
            size="small"
            onChange={handleImportTagChange}
            value={importTag}
            sx={{ mb: 0.5, width: "200px" }}
          />
        </ButtonWrapper>

        <ButtonWrapper>
          <ActionButton
            onClick={handleDownloadTemplate}
            variant="contained"
            color="inherit"
            sx={{ width: "200px" }}
          >
            <T keyName="import.csv_templates_button" />
          </ActionButton>
        </ButtonWrapper>
      </ButtonsContainer>

      <Typography color="primary" sx={{ mt: 1 }}>
        {output}
      </Typography>
    </View>
  );
}