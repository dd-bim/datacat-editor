import { useQuery } from '@apollo/client/react';
import { CatalogRecordType, TranslationPropsFragment, SearchResultPropsFragment, SubjectWithPropsAndListsPropsFragment, ValueListWithValuesPropsFragment, ValueListWithValuesDocument, FindSubjectsWithPropsAndListsDocument, FindConceptsForOntoExportDocument } from '../generated/graphql';
import { Writer } from 'n3';
import FileSaver from 'file-saver';
import DataFactory from '@rdfjs/data-model';
import { T } from '@tolgee/react';
import Button from "@mui/material/Button";
import { useState } from 'react';
import { MenuItem, Select, Typography } from '@mui/material';
import View from './View.js';

const base = "http://example.org/datacat#";
const dcUrl = 'http://purl.org/dc/terms/';
const owlUrl = 'http://www.w3.org/2002/07/owl#';
const dcterms = namespace(dcUrl);
const ex = namespace(base);
const owl = namespace(owlUrl);
const rdf = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const rdfs = namespace('http://www.w3.org/2000/01/rdf-schema#');
const triples: DataFactory.Quad[] = [];

function namespace(base: string) {
  return (suffix: string) => base + suffix;
}

export const OntologyExportView: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("de");

  const { data, loading, error } = useQuery(FindConceptsForOntoExportDocument, {
    variables: {
      input: {
        entityTypeIn: [CatalogRecordType.Property, CatalogRecordType.Value],
      },
      pageSize: 1000,
      pageNumber: 0
    },
    fetchPolicy: "cache-first" //'cache-and-network'
  });
  const items: SearchResultPropsFragment[] = (data?.search.nodes || []).map((record: any) => {
    if (record.recordType === "Dictionary" && record.dname?.texts?.length > 0) {
      return {
        ...record,
        name: record.dname.texts[0].text,
      };
    }
    return record;
  });

  const { data: subData, loading: subLoading, error: subError } = useQuery(FindSubjectsWithPropsAndListsDocument, {
    variables: {
      input: {
        tagged: ["e9b2cd6d-76f7-4c55-96ab-12d084d21e96"], // only classes
        pageSize: 1000,
        pageNumber: 0
      }
    },
    fetchPolicy: "cache-first" //"cache-and-network"
  });

  const { data: valueListData, loading: valueListLoading, error: valueListError } = useQuery(ValueListWithValuesDocument, {
    variables: {
      input: {
        pageSize: 1000,
        pageNumber: 0
      }
    },
    fetchPolicy: "cache-first" //"cache-and-network"
  });

  const handleOntologyExport = async () => {
    if (!loading && !error && items) {
      console.log("Data: ", items)
      items.forEach((element) => {

        if (element.tags.some((tag: any) => tag.name === "Merkmal")) {
          createConcept(element, "ObjectProperty", selectedLanguage);
        } else {
          createConcept(element, "Class", selectedLanguage);
        }
      });

      if (subData && !subLoading && !subError) {
        subData?.findSubjects?.nodes.forEach((subject: SubjectWithPropsAndListsPropsFragment) => {
          const node = createConcept(subject, "Class", selectedLanguage);

          const relatedProperties = subject.properties ?? [];

          let c = 1;
          relatedProperties.forEach((prop) => {
            let relProperty = formText(prop.name || "");
            if (selectedLanguage === "en") {
              prop.names.forEach((n) => {
                n.texts.forEach((text) => {
                  if (text.language.code === "en") relProperty = formText(text.text);
                });
              });
            }
            const wLists = prop.possibleValues || [];

            const wListNames = wLists.map((wList) => {
              if (selectedLanguage === "en") {
                wList.names.forEach((n) => {
                  n.texts.forEach((text) => {
                    if (text.language.code === "en") return formText(text.text);
                  });
                });
              }
              return formText(wList.name || "no_name");
            });

            // create a restriction for each class and property over the value lists
            if (wListNames.length > 0) {
              const restriction = DataFactory.blankNode();
              triples.push(
                DataFactory.quad(node, DataFactory.namedNode(rdfs("subClassOf")), restriction)
              );
              triples.push(
                DataFactory.quad(restriction, DataFactory.namedNode(rdf("type")), DataFactory.namedNode(owl("Restriction")))
              );
              triples.push(
                DataFactory.quad(restriction, DataFactory.namedNode(owl("onProperty")), DataFactory.namedNode(ex(relProperty)))
              );

              if (wListNames.length == 1) {
                triples.push(
                  DataFactory.quad(restriction, DataFactory.namedNode(owl("allValuesFrom")), DataFactory.namedNode(ex(wListNames[0])))
                );
                console.log("Single Value List: " + wListNames[0]);
              } else {
                var union = wListNames.map(n => DataFactory.namedNode(ex(n)));
                const unionList = DataFactory.blankNode();
                triples.push(
                  DataFactory.quad(restriction, DataFactory.namedNode(owl("allValuesFrom")), unionList)
                );
                triples.push(
                  DataFactory.quad(unionList, DataFactory.namedNode(rdf("type")), DataFactory.namedNode(owl("Class")))
                );
                triples.push(
                  DataFactory.quad(unionList, DataFactory.namedNode(owl("unionOf")), createRDFList(union))
                );
              }
              c += 1;
            }

          });
        });

      }

      // create triples for value lists and their ordered values
      if (valueListData && !valueListLoading && !valueListError) {
        valueListData.findValueLists?.nodes.forEach((valueList: ValueListWithValuesPropsFragment) => {
          const vNode = createConcept(valueList, "Class", selectedLanguage);

          const orderedValues = valueList.values || [];

          const orderedValueNodes = [...(Array.isArray(orderedValues) ? orderedValues : orderedValues.nodes || [])]
            .sort((a, b) => {
              const orderA = typeof a.order === "number" ? a.order : 0;
              const orderB = typeof b.order === "number" ? b.order : 0;
              return orderA - orderB;
            })
            .map((orderedValue) => {
              const value = orderedValue.orderedValue;
              let valName = formText(value.name || "");
              if (selectedLanguage === "en") {
                value.names.forEach((n) => {
                  n.texts.forEach((text) => {
                    if (text.language.code === "en") valName = formText(text.text);
                  });
                });
              }
              return DataFactory.namedNode(ex(valName));
            });

          // create a ordered list
          if (orderedValueNodes.length > 0) {
            const rdfList = createRDFList(orderedValueNodes);
            triples.push(
              DataFactory.quad(vNode, DataFactory.namedNode(ex("hasValue")), rdfList)
            );
          }


        });
      }

      // give triples to the writer
      writeTurtle();
    }
  };

  if (error) return <div>Fehler: {error.message}</div>;
  
  const renderDescription = () => {
    return (
      <span style={{ whiteSpace: "pre-line" }}>
        <T keyName="export_view.description_ontology" />
      </span>
    );
  };
  return (
    <View heading={<T keyName="export_view.heading_ontology" />}>
      <Typography variant={"body1"}>
        {renderDescription()}
      </Typography>
      <Select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        size="small"
        style={{ marginRight: 16 }}
      >
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="en">English</MenuItem>
      </Select>
      <Button onClick={handleOntologyExport} disabled={loading || subLoading}>
        <T keyName="export_view.export_ontology_button" />
      </Button>
    </View>
  );
};

export function createConcept(concept: SearchResultPropsFragment | SubjectWithPropsAndListsPropsFragment | ValueListWithValuesPropsFragment, type: string, lang?: string): [DataFactory.NamedNode] {
  var name = formText(concept.name || "");
  if (lang === "en")
    concept.names.forEach((n) => {
      n.texts.forEach((text) => {
        if (text.language.code === "en") name = formText(text.text);
      });
    });

  if (name === "" && "nominalValue" in concept) {
    if (typeof concept.nominalValue === "string") {
      name = formText(concept.nominalValue);
    }
  }

  const cNode = DataFactory.namedNode(ex(name));
  const id = concept.id.replace(/\$/g, "0");

  // make triples for each existing property
  triples.push(DataFactory.quad(cNode, DataFactory.namedNode(rdf("type")), DataFactory.namedNode(owl(type))));
  concept.names.forEach((n: TranslationPropsFragment) => {
    n.texts.forEach((name) => {
      triples.push(
        DataFactory.quad(
          cNode,
          DataFactory.namedNode(rdfs("label")),
          DataFactory.literal(name.text, name.language.code)
        )
      );
    });
  });
  triples.push(DataFactory.quad(cNode, DataFactory.namedNode(dcterms("identifier")), DataFactory.literal(id)));
  
  // __typename nur wenn vorhanden
  if ('__typename' in concept && concept.__typename) {
    triples.push(
      DataFactory.quad(cNode, DataFactory.namedNode(dcterms("type")), DataFactory.literal(concept.__typename))
    );
  }

  if ("descriptions" in concept && Array.isArray(concept.descriptions)) {
    concept.descriptions?.forEach((d: TranslationPropsFragment) => {
      d.texts.forEach((description) => {
        triples.push(
          DataFactory.quad(
            cNode,
            DataFactory.namedNode((dcterms("description"))),
            DataFactory.literal(description.text, description.language.code)
          )
        );
      });
    });
  }

  // majorVersion und minorVersion nur wenn vorhanden
  if ('majorVersion' in concept && concept.majorVersion) triples.push(DataFactory.quad(cNode, DataFactory.namedNode(ex('majorVersion')), DataFactory.literal(concept.majorVersion.toString(), "xsd:integer")));
  if ('minorVersion' in concept && concept.minorVersion) triples.push(DataFactory.quad(cNode, DataFactory.namedNode(ex('minorVersion')), DataFactory.literal(concept.minorVersion.toString(), "xsd:integer")));

  return cNode;
}

function writeTurtle() {
  const writer = new Writer({
    prefixes: {
      '': base,
      owl: owlUrl,
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      dcterms: dcUrl,
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#'
    }
  });
  const ontologyHeader =
    `<${base}> rdf:type owl:Ontology .\n` +
    `<${base}> owl:versionInfo "datacat Export v1"^^xsd:string .\n\n`;

  console.log("Number of Triples: " + triples.length);
  writer.addQuads(triples);

  writer.end((error: Error | null, result: string) => {
    if (error) {
      console.error(error);
      return;
    }
    // Header nach den Prefixes einfügen
    const prefixEnd = result.indexOf('\n\n') + 2; // nach dem Prefix-Block
    const turtleWithHeader =
      result.slice(0, prefixEnd) +
      ontologyHeader +
      result.slice(prefixEnd);

    const blob = new Blob([turtleWithHeader], { type: 'text/turtle;charset=utf-8' });
    FileSaver.saveAs(blob, 'datacat.ttl');
  });
}

function formText(name: string): string {
  const arr = name.split(' ');
  var newName = "";
  arr.forEach(s => {
    newName += s.charAt(0).toUpperCase() + s.slice(1);
  })
  return newName
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-zA-Z0-9]/g, "");
}

function createRDFList(elements: DataFactory.NamedNode[]) {
  if (elements.length === 0) {
    return DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil');
  }
  const first = elements[0];
  const rest = elements.slice(1);
  const bnode = DataFactory.blankNode();
  triples.push(
    DataFactory.quad(bnode, DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'), first)
  );
  triples.push(
    DataFactory.quad(bnode, DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'), createRDFList(rest))
  );
  return bnode;
}