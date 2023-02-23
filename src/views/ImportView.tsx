import Button from "@material-ui/core/Button";
import View from "./View";
import Typography from "@material-ui/core/Typography";
import { useEffect, useState } from "react";
import { FindTagsResultFragment, SimpleRecordType, useCreateEntryMutation, useCreateTagMutation, useFindTagsQuery } from "../generated/types";
import { v4 as uuidv4 } from "uuid";

export const IMPORT_TAG_ID = "CLI-IMPORT";
type entity = {
    id: string,
    typ: string,
    tags: string,
    name: string,
    description: string,
    versionId: string
}

export function ImportView() {
    const [file, setFile] = useState(null);
    const entities: entity[] = [];
    const [createTag] = useCreateTagMutation();
    const [tags, setTags] = useState<FindTagsResultFragment[]>([]);

    const { data } = useFindTagsQuery({
        variables: {
            pageSize: 100
        }
    });

    // load existing tags from database
    useEffect(() => {
        setTags(data?.findTags.nodes ?? [])
    }, [data]);

    // create new records by query
    const [create] = useCreateEntryMutation({
        update: cache => {
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    hierarchy: (value, { DELETE }) => DELETE
                }
            });
            cache.modify({
                id: "ROOT_QUERY",
                fields: {
                    search: (value, { DELETE }) => DELETE
                }
            });
        }
    });

    // handle file selection
    const handleFileChange = (event: any) => {
        const selectedFile = event.target.files && event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    // handle upload and file reading on import button click 
    const handleUpload = async () => {
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = async () => {
            const text = reader.result as string;
            const lines = text.split("\n");
            lines.forEach((line, index) => {
                if (index === 0) return;
                if (line === "" || line === undefined || line === null) return;
                const content = line.replaceAll("\"", "").split(';');
                entities.push({ id: content[0], typ: content[1], tags: content[2], name: content[3], description: content[5], versionId: content[6] });
            })

            handleOnCreateTag(IMPORT_TAG_ID, IMPORT_TAG_ID);
            importEntities(entities, tags);
        };

    };

    // creates new tag in database
    const handleOnCreateTag = async (tagId: string, name: string) => {
        await createTag({
            variables: {
                input: {
                    tagId,
                    name
                }
            }
        });
    };

    // searches in tag list, if tag is already there
    const nameInTags = (nodes: FindTagsResultFragment[], searchName: string) => {
        return nodes.some(({ name }) => name === searchName);
    }

    // gives id of existing tag in tag list
    const idOfTag = (nodes: FindTagsResultFragment[], searchName: string) => {
        return nodes.find((obj) => obj.name === searchName)!.id;
    }

    // imports the entities into the database
    const importEntities = async (entities: entity[], tagArr: FindTagsResultFragment[]) => {

        const tArr = [...tagArr];

        // create entity object from each row and push to database
        for (const {
            id,
            typ,
            tags,
            name,
            description,
            versionId,
        } of entities) {
            const tagIds = [IMPORT_TAG_ID];
            const tagList = tags.split(",");

            for (const tag of tagList) {
                if (!nameInTags(tArr, tag)) {
                    const tagId = uuidv4();
                    try {
                        handleOnCreateTag(tagId, tag);
                        tArr.push({ id: tagId, name: tag })
                        console.log(`New tag ${tag} created`);
                    } catch (e) {
                        console.log(`Create new tag ${tag} failed: ` + e);
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
                            catalogEntryType: typ.replace("Xtd", "").replace("WithUnit", "")! as unknown as SimpleRecordType,
                            tags: tagIds,
                            properties: {
                                id: idString,
                                version: {
                                    versionId: versionString,
                                },
                                names: [
                                    {
                                        languageTag: "de-DE",
                                        value: name,
                                    },
                                ],
                                descriptions: descriptionString,
                            }
                        }
                    }
                });
                console.log(`Created new record "${typ}"... ${name} (${id})`);
            } catch (e) {
                console.log(`Error creating record "${typ}"... ${name} (${id}): ` + e);
            }


        }
    }

    return (
        <View heading="Katalog Importieren">
            <Typography variant={"body1"}>
                TODO
            </Typography>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <Button onClick={handleUpload}>CSV importieren</Button>
        </View>
    );
};




