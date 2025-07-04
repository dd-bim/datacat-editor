declare module '@rdfjs/data-model' {
  import * as RDF from 'rdf-js';
  export function namedNode(value: string): RDF.NamedNode;
  export function literal(value: string, languageOrDatatype?: string | RDF.NamedNode): RDF.Literal;
  export function quad(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph?: RDF.Term): RDF.Quad;
  export type Quad = RDF.Quad;
  export type NamedNode = RDF.NamedNode;
  export function blankNode(value?: string): RDF.BlankNode;
}