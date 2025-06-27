import { CatalogRecordType, MultiLanguageTextPropsFragment, SearchResultPropsFragment, useFindExternalDocumentsQuery, useFindItemQuery, useFindSubjectsQuery, useGetDocumentEntryQuery } from '../generated/types.js';
// import { DataFactory, NamedNode, Quad } from 'rdf-data-factory';
import { Writer } from 'n3';
import FileSaver from 'file-saver';
import dataFactory from '@rdfjs/data-model';

const regex = /\$/g;
const ttl = "datacat.ttl";
const base = "http://example.org/datacat#";
const processMode = "all";
const language = "de";
const dcUrl = 'http://purl.org/dc/terms/';
const owlUrl = 'http://www.w3.org/2002/07/owl#';
const dcterms = namespace(dcUrl);
const ex = namespace(base);
const owl = namespace(owlUrl);
const rdf = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const rdfs = namespace('http://www.w3.org/2000/01/rdf-schema#');
const f = new DataFactory();

function namespace(base: string) {
  return (suffix: string) => base + suffix;
}

export function ontologyExport() {

  // if file already exists, clean it and write new file with header
  // if (fs.existsSync(ttl)) fs.truncateSync(ttl);
  // const header = `@prefix : <${base}> .\n` +
  //   `@prefix owl: <http://www.w3.org/2002/07/owl#> .\n` +
  //   `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n` +
  //   `@prefix rdf: <${rdf}> .\n` +
  //   `@prefix dcterms: <${dcUrl}> .\n` +
  //   `@prefix rdfs: <${rdfs}> .\n\n` +
  //   `<${base}> rdf:type owl:Ontology .\n` +
  //   `<${base}> owl:versionInfo "datacat Export v1"^^xsd:string .\n\n`;
  // fs.writeFileSync(ttl, header, { flag: "a" });

  // export complete data catalogue
  if (processMode == "all") {
    exportCatalogue();
  } else {
    processClasses("Beleuchtung");
  }
  // return "Hello";
}

// parse triples to turtle file
// export function writeTurtle(triples: Quad[]) {

  // const parse = rdf.TurtleParser.parse(triples.join('').toString(), base);
  // const profile = rdf.environment.createProfile();
  // profile.setDefaultPrefix(base);
  // profile.setPrefix('dcterms', dcUrl);
  // profile.setPrefix('rdf', rdf);
  // profile.setPrefix('rdfs', rdfs);
  // profile.setPrefix('owl', owlUrl);
  // const turtle = parse.graph
  //   .toArray()
  //   .sort(function (a: any, b: any) { return a.compare(b); })
  //   .map(function (stmt: any) {
  //     return stmt.toTurtle(profile);
  //   });

  // const out = turtle.join('\n').replaceAll('"http://www.w3.org/2002/07/owl#', 'owl:').replaceAll(base, ':').replaceAll(' )" .', ') .')
  // fs.writeFileSync(ttl, out + '\n', { flag: "a" });
// }
export function writeTurtle(triples: Quad[]) {
  const writer = new Writer({
    prefixes: {
      '': base,
      owl: owlUrl,
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdf: rdf,
      dcterms: dcUrl,
      rdfs: rdfs
    }
  });

  
  writer.addQuads(triples);

  writer.end((error: Error | null, result: string) => {
    if (error) {
      console.error(error);
      return;
    }
    const blob = new Blob([result], { type: 'text/turtle;charset=utf-8' });
    FileSaver.saveAs(blob, 'datacat.ttl');
  });
}



// export complete catalogue
export async function exportCatalogue() {

  // process documents
  const { data, loading, error } = useFindItemQuery({
    variables: {
      input: {
        entityTypeIn: [CatalogRecordType.ExternalDocument],
        pageSize: 1000,
        pageNumber: 0
      }
    }
  });
  if (!loading && !error && data) {
    const items = data?.search.nodes ?? [];
    processConcepts(items);
  }
  console.log("Query Error: ", error);
  // // process domain models
  // var dData = await queryResults(createFindBagsQuery("6f96aaa7-e08f-49bb-ac63-93061d4c5db2"));
  // processConcepts(dData, "Domain Model");

  // // process groups
  // var gData = await queryResults(createFindBagsQuery("5997da9b-a716-45ae-84a9-e2a7d186bcf9"));
  // processConcepts(gData, "Group");

  // // process groups
  // var pData = await queryResults(createFindNestsQuery("a27c8e3c-5fd1-47c9-806a-6ded070efae8"));
  // processConcepts(pData, "Property Group");

  // process classes with properties, values and units
  processClasses("");
}

export function processConcepts(items: SearchResultPropsFragment[]) {
  const triples: Quad[] = [];
  console.log("Number of elements: " + items.length);
  items.forEach((element) => {
    const [gNode, gName] = createConcept(element, "Class");
    console.log("Processed: " + gName);

    const classes: any[] = [];
    let relatingConcepts: any[] = [];
    let relProperty = "";
    if (element.tags.some((tag: any) => tag.name === "XtdExternalDocument")) {
      const { data, loading, error } = useGetDocumentEntryQuery({
        variables: {
          id: element.id
        }
      });
      relatingConcepts = data?.node?.documents ?? [];
      relProperty = "documents";
    }
    // else {
    //   rel = element.collects;
    //   relProperty = "collects";
    // }

    if (relatingConcepts.length != 0) {
      relatingConcepts.forEach(c => {
        const name = formText(c.name || "");
        // if (language == "en")
        //   thing.names.forEach((n) => {
        //     if (n.language.languageTag == "en") name = n.value;
        //   });
        const cNode = f.namedNode(ex(name));
        classes.push(cNode);
      });
    }

    if (classes.length > 0) {
      const restriction = f.namedNode(ex(gName + "Restriction"));
        triples.push(
        f.quad(restriction, f.namedNode(rdfs("type")), f.namedNode(owl("Restriction")))
      );
      triples.push(
        f.quad(restriction, f.namedNode(owl("onProperty")), f.namedNode(ex(relProperty)))
      );
      triples.push(
        f.quad(gNode, f.namedNode(rdfs("subClassOf")), restriction)
      );

      if (classes.length == 1) {
        triples.push(
          f.quad(restriction, f.namedNode(owl("allValuesFrom")), classes[0])
        );
      } else {
        var union = "";
        classes.forEach((val) => {
          union += val + " ";
        });
        triples.push(
          f.quad(
            restriction,
            f.namedNode(owl("allValuesFrom")),
            f.literal(owl("unionOf") + " (" + union + ")")
          )
        );
      }
    }

  });

  // give triples to the writer
  writeTurtle(triples);
}

export async function processClasses(className: string) {
  const { data, loading, error } = useFindSubjectsQuery({
    variables: {
      input: {
        query: className,
        pageSize: 1000,
        pageNumber: 0
      }
    }
  });

  const triples: any[] = [];
  const items = data?.findSubjects?.nodes ?? [];
  console.log("Number of Classes: " + items.length);
  items.forEach((element) => {
    const [cNode, cName, cTriples] = createConcept(element, "Class");
    triples.push.apply(triples, cTriples);
    console.log("Processed Class: " + cName);

    // element.properties.forEach((prop) => {
    //   const [pNode, pName, pTriples] = createConcept(prop, "ObjectProperty");
    //   triples.push.apply(triples, pTriples);
    //   triples.push(new Triple(pNode, rdfs.IRI_RDFS_DOMAIN, cNode));

    //   var measures = [];
    //   prop.assignedMeasures.nodes.forEach((m) => {
    //     m.relatedMeasures.forEach((measure) => {
    //       const [lNode, lName, lTriples] = createConcept(measure, "Class");
    //       triples.push.apply(triples, lTriples);
    //       measures.push(lNode);

    //       if (measures != []) {
    //         const restriction = new NamedNode(ex(cName + "Restriction"));
    //         triples.push(
    //           new Triple(restriction, rdfs.IRI_RDF_TYPE, owl("Restriction"))
    //         );
    //         triples.push(new Triple(restriction, owl("onProperty"), pNode));
    //         triples.push(
    //           new Triple(cNode, rdfs.IRI_RDFS_SUBCLASSOF, restriction)
    //         );

    //         if (measures.length == 1) {
    //           triples.push(
    //             new Triple(restriction, owl("allValuesFrom"), measures[0])
    //           );
    //           triples.push(new Triple(pNode, rdfs.IRI_RDFS_RANGE, measures[0]));
    //         } else {
    //           var union = "";
    //           measures.forEach((measure) => {
    //             union += measure + " ";
    //           });
    //           triples.push(
    //             new Triple(
    //               restriction,
    //               owl("allValuesFrom"),
    //               new Literal(owl("unionOf") + " (" + union + ")")
    //             )
    //           );
    //           triples.push(
    //             new Triple(pNode, rdfs.IRI_RDFS_RANGE, new Literal(owl("unionOf") + " (" + union + ")"))
    //           );
    //         }
    //       }

    //       const values = [];
    //       measure.assignedValues.nodes.forEach((v) => {
    //         v.relatedValues.forEach((value) => {
    //           const [vNode, vName, vTriples] = createConcept(value, "NamedIndividual");
    //           triples.push.apply(triples, vTriples);
    //           values.push(vNode);
    //         });
    //       });

    //       if (values != "") {
    //         const restriction = new NamedNode(ex(lName + "ValueRestriction"));
    //         triples.push(
    //           new Triple(restriction, rdfs.IRI_RDF_TYPE, owl("Restriction"))
    //         );
    //         triples.push(
    //           new Triple(restriction, owl("onProperty"), ex("hasValue"))
    //         );
    //         triples.push(
    //           new Triple(lNode, rdfs.IRI_RDFS_SUBCLASSOF, restriction)
    //         );

    //         if (values.length == 1) {
    //           triples.push(
    //             new Triple(restriction, owl("allValuesFrom"), values[0])
    //           );
    //         } else {
    //           var union = "";
    //           values.forEach((val) => {
    //             union += val + " ";
    //           });
    //           triples.push(
    //             new Triple(
    //               restriction,
    //               owl("allValuesFrom"),
    //               new Literal(owl("unionOf") + " (" + union + ")")
    //             )
    //           );
    //         }
    //       }

    //       const units = [];
    //       measure.assignedUnits.nodes.forEach((u) => {
    //         u.relatedUnits.forEach((unit) => {
    //           const [uNode, uName, uTriples] = createConcept(unit, "NamedIndividual");
    //           triples.push.apply(triples, uTriples);
    //           units.push(uNode);
    //         });
    //       });

    //       if (units != "") {
    //         const restriction = new NamedNode(ex(lName + "UnitRestriction"));
    //         triples.push(
    //           new Triple(restriction, rdfs.IRI_RDF_TYPE, owl("Restriction"))
    //         );
    //         triples.push(
    //           new Triple(restriction, owl("onProperty"), ex("hasUnit"))
    //         );
    //         triples.push(
    //           new Triple(lNode, rdfs.IRI_RDFS_SUBCLASSOF, restriction)
    //         );

    //         if (units.length == 1) {
    //           triples.push(
    //             new Triple(restriction, owl("allValuesFrom"), units[0])
    //           );
    //         } else {
    //           var union = "";
    //           units.forEach((val) => {
    //             union += val + " ";
    //           });
    //           triples.push(
    //             new Triple(
    //               restriction,
    //               owl("allValuesFrom"),
    //               new Literal(owl("unionOf") + " (" + union + ")")
    //             )
    //           );
    //         }
    //       }
    //     });
    //   });
    // });
  });
  writeTurtle(triples);
}

export function createConcept(concept: any, type: string): [NamedNode, string, Quad[]] {
  var triples = [];
  var name = formText(concept.name || "");
  // if (language == "en")
  //   concept.names.forEach((n) => {
  //     if (n.language.languageTag == "en") name = n.value;
  //   });

  const cNode = f.namedNode(ex(name)); // Lösung in datacat finden
  const id = concept.id.replace(regex, "0");

  // make triples for each existing property
  triples.push(f.quad(cNode, f.namedNode(rdfs("type")), f.namedNode(owl(type))));
  concept.names.forEach((n: MultiLanguageTextPropsFragment) => {
    n.texts.forEach((name) => {
      triples.push(
        f.quad(
          cNode,
          f.namedNode(rdfs("label")),
          f.literal(name.text, name.language.code)
        )
      );
    });
  });
  triples.push(f.quad(cNode, f.namedNode(dcterms("identifier")), f.literal(id)));
  triples.push(
    f.quad(cNode, f.namedNode(dcterms("type")), f.literal(concept.__typename))
  );
  concept.descriptions.forEach((d: MultiLanguageTextPropsFragment) => {
    d.texts.forEach((description) => {
      triples.push(
        f.quad(
          cNode,
          f.namedNode((dcterms("description"))),
          f.literal(description.text, description.language.code)
        )
      );
    });
  });

  if (concept.__typename === "XtdValue") {
    // if (concept.toleranceType) triples.push(new Triple(cNode, ex("toleranceType"), new Literal(concept.toleranceType)));
    // if (concept.lowerTolerance) triples.push(new Triple(cNode, ex("lowerTolerance"), new Literal(concept.lowerTolerance, "xsd:double")));
    // if (concept.upperTolerance) triples.push(new Triple(cNode, ex("upperTolerance"), new Literal(concept.upperTolerance, "xsd:double")));
    // if (concept.valueRole) triples.push(new Triple(cNode, ex("valueRole"), new Literal(concept.valueRole)));
    // if (concept.valueType) triples.push(new Triple(cNode, ex("valueType"), new Literal(concept.valueType)));
    if (concept.nominalValue) {
      if (/^-?\d+$/.test(concept.nominalValue)) {
        triples.push(f.quad(cNode, f.namedNode(ex("nominalValue")), f.literal(concept.nominalValue, "xsd:integer")));
      } else if (/^-?\d*\.\d+$/.test(concept.nominalValue)) {
        triples.push(f.quad(cNode, f.namedNode(ex("nominalValue")), f.literal(concept.nominalValue, "xsd:double")));
      } else {
        triples.push(f.quad(cNode, f.namedNode(ex("nominalValue")), f.literal(concept.nominalValue)));
      }
    }
  }

  if (concept.majorVersion) triples.push(f.quad(cNode, f.namedNode(ex('majorVersion')), f.literal(concept.majorVersion)));
  if (concept.minorVersion) triples.push(f.quad(cNode, f.namedNode(ex('minorVersion')), f.literal(concept.minorVersion)));

  // writeTurtle(triples);

  return [cNode, name, triples];
}

export function formText(name: string): string {
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






export default ontologyExport;