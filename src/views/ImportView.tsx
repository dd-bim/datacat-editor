import View from "./View";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  FindTagsResultFragment,
  RelationshipRecordType,
  SimpleRecordType,
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

export const IMPORT_TAG_ID = "KATALOG-IMPORT";
type entity = {
  id: string;
  typ: string;
  tags: string;
  name: string;
  description: string;
  versionId: string;
};
type relation = {
  entity1: string;
  relationId: string;
  relationshipType: string;
  entity2: string;
};

export function ImportView() {
  const [entitiesFile, setEntitiesFile] = useState(null);
  const [relationsFile, setRelationsFile] = useState(null);
  const entities: entity[] = [];
  const relations: relation[] = [];
  const [createTag] = useCreateTagMutation();
  const [tags, setTags] = useState<FindTagsResultFragment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [output, setOutput] = useState<string | React.ReactNode>("");
  const [init, setInit] = useState(false);
  const [importTag, setImportTag] = useState(IMPORT_TAG_ID);
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
    update: (cache) => {
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          hierarchy: (value, { DELETE }) => DELETE,
        },
      });
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          search: (value, { DELETE }) => DELETE,
        },
      });
    },
  });

  // create new relationship records by query
  const update = (cache: ApolloCache<any>) =>
    cache.modify({
      id: "ROOT_QUERY",
      fields: {
        hierarchy: (value, { DELETE }) => DELETE,
      },
    });
  const [createRelationship] = useCreateRelationshipMutation({ update });

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
    if (entitiesFile != null && relationsFile == null) {
      setLoaded(true);
      setOutput(
        <T keyName="import.note_entities_only">
          HINWEIS: Es werden nur Entitäten, keine Relationen zwischen diesen importiert!
        </T>
      );
    } else if (entitiesFile == null && relationsFile != null) {
      setLoaded(true);
      setOutput(
        <T keyName="import.note_relations_only">
          HINWEIS: Es werden nur Relationen importiert. Die Entitäten müssen bereits im Merkmalserver enthalten sein!
        </T>
      );
    } else if (entitiesFile != null && relationsFile != null) {
      setLoaded(true);
      setOutput("");
    } else {
      setLoaded(false);
    }
  }, [entitiesFile, relationsFile]);

  // handle upload and file reading on import button click
  const handleUpload = async () => {
    if (entitiesFile) {
      const entitiesReader = new FileReader();
      entitiesReader.readAsText(entitiesFile);

      entitiesReader.onload = async () => {
        const text = entitiesReader.result as string;
        const lines = text.split("\n");
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          const content = line
            .replaceAll('"', "")
            .replace(/\s/g, "")
            .split(";");
          if (index === 0) {
            const header = [
              "id",
              "typ",
              "tags",
              "name",
              "name_en",
              "description",
              "version",
              "createdBy",
              "created",
              "lastModified",
              "lastModifiedBy",
            ];
            let result = true;
            if (content.length === header.length) {
              for (let i = 0; i < content.length; i++) {
                if (content[i] !== header[i]) {
                  result = false;

                  return;
                }
              }
            } else {
              result = false;
            }
            if (!result) {
              setOutput(
                <T keyName="import.error_columns_mismatch">
                  Die Spaltennamen stimmen nicht mit der Vorgabe überein.
                </T>
              );
              return;
            }
          } else if (line === "" || line === undefined || line === null) {
            break;
          } else {
            entities.push({
              id: content[0],
              typ: content[1],
              tags: content[2],
              name: content[3],
              description: content[5],
              versionId: content[6],
            });
          }
        }

        if (importTag === "" || importTag === undefined || importTag === null) {
          handleOnCreateTag(IMPORT_TAG_ID, IMPORT_TAG_ID);
        } else {
          handleOnCreateTag(importTag, importTag);
        }
        await importEntities(entities, tags);
        setInit(true);
      };
    } else {
      setInit(true);
    }
  };

  // read relations if file exists and entities are imported completely, if file is existing on upload
  useEffect(() => {
    if (relationsFile && init) {
      const relationsReader = new FileReader();
      relationsReader.readAsText(relationsFile);

      relationsReader.onload = async () => {
        const text = relationsReader.result as string;
        const lines = text.split("\n");
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          const content = line
            .replaceAll('"', "")
            .replace(/\s/g, "")
            .split(";");
          if (index === 0) {
            const header = [
              "entity1",
              "entity1Type",
              "relationId",
              "relationshipType",
              "entity2",
              "entity2Type",
            ];
            let result = true;
            if (content.length === header.length) {
              for (let i = 0; i < content.length; i++) {
                if (content[i] !== header[i]) {
                  result = false;

                  return;
                }
              }
            } else {
              result = false;
            }
            if (!result) {
              setOutput(
                <T keyName="import.error_columns_mismatch">
                  Die Spaltennamen stimmen nicht mit der Vorgabe überein.
                </T>
              );
              return;
            }
          } else if (line === "" || line === undefined || line === null) {
            break;
          } else {
            relations.push({
              entity1: content[0],
              relationId: content[2],
              relationshipType: content[3],
              entity2: content[4],
            });
          }
        }

        await importRelations(relations);
      };
    }

    setLoaded(false);
    setEntitiesFile(null);
    setRelationsFile(null);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init]);

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
    let zip = new JSZip();

    const csvEntity =
      "id;typ;tags;name;name_en;description;version;createdBy;created;lastModified;lastModifiedBy";
    var entityBlob = new Blob([csvEntity], { type: "text/csv;charset=utf-8" });
    zip.file(`Entities.csv`, entityBlob);

    const csvRelation =
      "entity1;entity1Type;relationId;relationshipType;entity2;entity2Type";
    var relationBlob = new Blob([csvRelation], {
      type: "text/csv;charset=utf-8",
    });
    zip.file(`Relationships.csv`, relationBlob);

    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, `datacat_import_templates.zip`);
    });
  };

  // searches in tag list, if tag is already there
  const nameInTags = (nodes: FindTagsResultFragment[], searchName: string) => {
    return nodes.some(({ name }) => name === searchName);
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
    const tArr = [...tagArr];

    // create entity object from each row and push to database
    for (const { id, typ, tags, name, description, versionId } of entities) {
      const tagIds = [];
      if (importTag === "" || importTag === undefined || importTag === null) {
        tagIds.push(IMPORT_TAG_ID);
      } else {
        tagIds.push(importTag);
      }
      const tagList = tags.split(",");

      for (const tag of tagList) {
        if (!nameInTags(tArr, tag)) {
          const tagId = uuidv4();
          try {
            handleOnCreateTag(tagId, tag);
            tArr.push({ id: tagId, name: tag });
            enqueueSnackbar(<T keyName="import.new_tag_created" params={{ tag }} />);
          } catch (e) {
            setOutput(<T keyName="import.create_tag_failed" params={{ tag, error: e instanceof Error ? e.message : String(e) }} />);
          }
        }
        tagIds.push(idOfTag(tArr, tag));
      }

      const descriptionString = [];
      if (description) {
        descriptionString.push({
          languageTag: "de-DE",
          value: description,
        });
      }

      let versionString = null;
      if (versionId) {
        versionString = versionId;
      }

      let idString = id;
      if (!id) {
        idString = uuidv4();
      }

      try {
        await create({
          variables: {
            input: {
              catalogEntryType: typ
                .replace("Xtd", "")
                .replace("WithUnit", "")! as unknown as SimpleRecordType,
              tags: tagIds,
              properties: {
                id: idString,
                version: {
                  versionId: versionString,
                },
                names: [
                  {
                    languageTag: "de",
                    value: name,
                  },
                ],
                descriptions: descriptionString,
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

  // imports the relationships between the entities into database
  const importRelations = async (relationship: relation[]) => {
    // create relationship from each row and push to database
    for (const {
      entity1,
      relationId,
      relationshipType,
      entity2,
    } of relationship) {
      try {
        await createRelationship({
          variables: {
            input: {
              relationshipType: relationshipType.replace(
                "XtdRel",
                ""
              )! as unknown as RelationshipRecordType,
              properties: {
                id: relationId,
                names: [],
              },
              fromId: entity1,
              toIds: [entity2],
            },
          },
        });

        enqueueSnackbar(
          <T 
            keyName="import.created_relationship"
            params={{ relationshipType, entity1, entity2 }}
          />
        );
      } catch (e) {
        setOutput(
          <T 
            keyName="import.error_creating_relationship"
            params={{ relationshipType, entity1, entity2, error: e instanceof Error ? e.message : String(e) }}
          />
        );
      }
    }
  };

  return (
    <View heading={<T keyName="import.heading">Katalog Importieren (CSV)</T>}>
      <Typography variant={"body1"} component="div">
        <T keyName="import.description">
          Über diese Seite lassen sich Entitäten und deren Relationen importieren. Analog zum Export können hier zwei
          CSV-Dateien importiert werden. Die eine Datei enthält die Entitäten in folgendem Schema:
        </T>
        <br />
        <Box component="div">
          <table>
            <thead>
              <tr>
                <th>
                  id<sup>o</sup>
                </th>
                <th>
                  typ<sup>r</sup>
                </th>
                <th>
                  tags<sup>r</sup>
                </th>
                <th>
                  name<sup>r</sup>
                </th>
                <th>name_en</th>
                <th>
                  description<sup>o</sup>
                </th>
                <th>
                  version<sup>o</sup>
                </th>
                <th>createdBy</th>
                <th>created</th>
                <th>lastModified</th>
                <th>lastModifiedBy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
              </tr>
            </tbody>
          </table>
        </Box>
        <br />
        <T keyName="import.entity_columns_note">
          Mit r gekennzeichnete Spalten müssen für jede Entität ausgefüllt sein, mit o gekennzeichnete Spalten können
          optional Werte enthalten. Die restlichen Spalten werden beim Import nicht berücksichtigt und können daher leer
          bleiben.
        </T>
        <br />
        <T keyName="import.tags_note">
          Damit die entitäten in der datacatEditor Oberfläche sichtbar sind, müssen ihnen Tags der dort gewählten
          Taxonomie gegeben werden. (Referenzdokument, Fachmodell, Gruppe, Klasse, Merkmalsgruppe, Merkmal, Größe, Wert,
          Maßeinheit)
        </T>
        <br />
        <T keyName="import.relation_columns_note">
          Die andere Datei enthält optional die Relationen zwischen Entitäten mit den folgenden Spalten:
        </T>
        <br />
        <b>
          <T keyName="import.relation_columns">entity1</T><sup>r</sup> entity1Type <T keyName="import.relation_id">relationId</T><sup>r</sup> <T keyName="import.relationship_type">relationshipType</T><sup>r</sup> <T keyName="import.entity2">entity2</T><sup>r</sup>{" "}
          entity2Type
        </b>
        <br />
        <T keyName="import.relation_columns_note_2">Die Entitätstypen können hier leer gelassen werden.</T>
        <br />
        <br />
      </Typography>
      <Box
        component="div"
        style={{
          display: "flex",
          alignItems: "flex-start", // Alle Buttons oben ausrichten
          marginBottom: "16px", // Optional für zusätzlichen Abstand
          flexWrap: "wrap", // Erlaubt das Umwickeln der Elemente, falls der Platz nicht ausreicht
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "16px",
            textAlign: "center",
          }}
        >
          <Button
            variant="contained"
            component="label"
            color="primary" // Farbe anpassen
            style={{ marginBottom: "4px" }}
          >
            <T keyName="import.entities_file_button">Entitäten Datei auswählen</T>
            <input
              type="file"
              name="entitiesFile"
              accept=".csv"
              hidden
              ref={fileRef}
              onChange={handleFileChange}
            />
          </Button>
          <Typography color="textSecondary">
            {entitiesFile === null ? <T keyName="import.no_file_selected">Keine Datei ausgewählt</T> : ""}
          </Typography>
        </Box>

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "16px",
            textAlign: "center",
          }}
        >
          <Button
            variant="contained"
            component="label"
            color="primary" // Farbe anpassen
            style={{ marginBottom: "4px" }}
          >
            <T keyName="import.relations_file_button">Relationen Datei auswählen</T>
            <input
              type="file"
              name="relationsFile"
              accept=".csv"
              hidden
              ref={fileRef}
              onChange={handleFileChange}
            />
          </Button>
          <Typography color="textSecondary">
            {relationsFile === null ? <T keyName="import.no_file_selected">Keine Datei ausgewählt</T> : ""}
          </Typography>
        </Box>

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "16px",
            textAlign: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary" // Farbe anpassen
            onClick={handleUpload}
            disabled={!loaded}
            style={{ marginBottom: "4px" }}
          >
            <T keyName="import.import_button">Importieren</T>
          </Button>
        </Box>

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginRight: "16px",
          }}
        >
          <TextField
            id="importTag"
            label={<T keyName="import.import_tag_label">Import Tag (optional)</T>}
            name="importTag"
            variant="outlined"
            size="small"
            onChange={handleImportTagChange}
            style={{ marginBottom: "4px", width: "200px" }} // Einheitlicher Abstand wie Buttons
          />
        </Box>

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "16px",
            textAlign: "center",
          }}
        >
          <Button
            onClick={handleDownloadTemplate}
            variant="contained"
            color="inherit"
            style={{ marginBottom: "4px", width: "200px" }}
          >
            <T keyName="import.csv_templates_button">CSV Templates</T>
          </Button>
        </Box>
      </Box>

      <Typography color="primary" style={{ marginTop: "8px" }}>
        {output}
      </Typography>
    </View>
  );
}
